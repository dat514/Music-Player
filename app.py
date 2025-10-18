from flask import Flask, request, jsonify, send_from_directory
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import sqlite3
from datetime import timedelta
import logging
import os
import random
import time
from unidecode import unidecode
import json
import re
import mutagen.mp3
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from DownloadWithLinkTool.tool import download_media, get_ffmpeg_path

load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
bcrypt = Bcrypt(app)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
jwt = JWTManager(app)

cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:6001,https://proteins-achievement-kit-connections.trycloudflare.com').split(',')
CORS(app, resources={r"/*": {"origins": cors_origins}})

MUSIC_DIR = 'music'
THUMBNAIL_DIR = 'thumbnails'
BACKGROUND_DIR = 'backgrounds'
RANDOM_THUMBNAIL_DIR = 'randomthumbnail'
AVATAR_DIR = 'avatars'
PROJECT_UPLOAD_DIR = 'project_upload'
TRACKS_JSON = 'tracks.json'
PENDING_USERS_FILE = 'pending_users.txt'
os.makedirs(MUSIC_DIR, exist_ok=True)
os.makedirs(THUMBNAIL_DIR, exist_ok=True)
os.makedirs(BACKGROUND_DIR, exist_ok=True)
os.makedirs(RANDOM_THUMBNAIL_DIR, exist_ok=True)
os.makedirs(AVATAR_DIR, exist_ok=True)
os.makedirs(PROJECT_UPLOAD_DIR, exist_ok=True)

def init_tracks_json():
    if not os.path.exists(TRACKS_JSON):
        with open(TRACKS_JSON, 'w') as f:
            json.dump([], f)
init_tracks_json()

def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        background TEXT
    )''')
    c.execute("PRAGMA table_info(users)")
    columns = [info[1] for info in c.fetchall()]
    if 'background' not in columns:
        c.execute('ALTER TABLE users ADD COLUMN background TEXT')
    c.execute('SELECT * FROM users WHERE username = ? OR email = ?', ('admin', 'admin@example.com'))
    if not c.fetchone():
        hashed_password = bcrypt.generate_password_hash('admin_password').decode('utf-8')
        c.execute('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                  ('admin', 'admin@example.com', hashed_password, 'admin'))
    conn.commit()
    conn.close()
init_db()

def init_pending_users():
    if not os.path.exists(PENDING_USERS_FILE):
        with open(PENDING_USERS_FILE, 'w') as f:
            json.dump([], f)
init_pending_users()

def generate_unique_id(existing_ids):
    while True:
        new_id = f"{random.randint(0, 9999):04d}"
        if new_id not in existing_ids:
            return new_id

def clean_title_for_filename(title):
    cleaned = unidecode(title).lower()
    cleaned = re.sub(r'[^a-z0-9\s]', '', cleaned)
    cleaned = re.sub(r'\s+', '_', cleaned).strip('_')
    return cleaned

@app.route('/config', methods=['GET'])
def get_config():
    try:
        file_path = os.path.join(os.path.dirname(__file__), "RunAndUpdateLink", "cloudflare_url.txt")
        with open(file_path, "r", encoding="utf-8") as f:
            url = f.read().strip()
    except Exception as e:
        url = "https://127.0.0.1:6001"
    return jsonify({"api_base_url": url}), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'Username, email, and password are required'}), 400

    if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
        return jsonify({'message': 'Invalid email format'}), 400

    if not re.match(r'^(?=.*[A-Za-z])(?=.*\d).{8,}$', password):
        return jsonify({'message': 'Password must be at least 8 characters long and contain both letters and numbers'}), 400

    logger.info(f"User register attempt: username={username}, email={email}")
    
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT username, email FROM users WHERE username = ? OR email = ?', (username, email))
    if c.fetchone():
        conn.close()
        return jsonify({'message': 'Username or email already exists'}), 400
    conn.close()

    with open(PENDING_USERS_FILE, 'r') as f:
        pending_users = json.load(f)
    if any(user['email'] == email or user['username'] == username for user in pending_users):
        return jsonify({'message': 'Username or email is already pending verification'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    pending_users.append({
        'username': username,
        'email': email,
        'password': hashed_password,
        'role': 'user'
    })
    with open(PENDING_USERS_FILE, 'w') as f:
        json.dump(pending_users, f, indent=2)

    logger.info(f"User pending verification: username={username}, email={email}")
    return jsonify({'message': 'Registration pending verification. Please wait for admin approval.'}), 201

@app.route('/verify', methods=['POST'])
@jwt_required()
def verify_user():
    current_user = get_jwt_identity()
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT role FROM users WHERE username = ?', (current_user,))
    user = c.fetchone()
    if not user or user[0] != 'admin':
        conn.close()
        return jsonify({'message': 'Unauthorized: Admin access required'}), 403

    data = request.get_json()
    email = data.get('email')
    if not email:
        conn.close()
        return jsonify({'message': 'Email is required'}), 400

    try:
        with open(PENDING_USERS_FILE, 'r') as f:
            pending_users = json.load(f)
    except:
        conn.close()
        return jsonify({'message': 'No pending users found'}), 404

    user_to_verify = next((user for user in pending_users if user['email'] == email), None)
    if not user_to_verify:
        conn.close()
        return jsonify({'message': 'Email not found in pending users'}), 404

    try:
        c.execute('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                  (user_to_verify['username'], user_to_verify['email'], user_to_verify['password'], user_to_verify['role']))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'message': 'Username or email already exists in database'}), 400
    conn.close()

    pending_users = [user for user in pending_users if user['email'] != email]
    with open(PENDING_USERS_FILE, 'w') as f:
        json.dump(pending_users, f, indent=2)

    logger.info(f"User verified: email={email} by admin={current_user}")
    return jsonify({'message': f'User with email {email} verified successfully'}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    logger.info(f"User login: username={username}")
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = c.fetchone()
    conn.close()

    if not user or not bcrypt.check_password_hash(user[3], password):
        return jsonify({'message': 'Invalid username or password'}), 401

    access_token = create_access_token(identity=username, expires_delta=timedelta(hours=1))
    return jsonify({'token': access_token}), 200

@app.route('/select-background', methods=['POST'])
@jwt_required()
def select_background():
    current_user = get_jwt_identity()
    data = request.get_json()
    background_url = data.get('background_url')

    if not background_url:
        return jsonify({'message': 'Background URL is required'}), 400

    if not background_url.startswith('/backgrounds/'):
        return jsonify({'message': 'Invalid background URL'}), 400
    filename = os.path.basename(background_url)
    file_path = os.path.join(BACKGROUND_DIR, filename)
    if not os.path.exists(file_path):
        return jsonify({'message': 'Background file does not exist'}), 404

    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    try:
        c.execute('UPDATE users SET background = ? WHERE username = ?', (background_url, current_user))
        if c.rowcount == 0:
            conn.close()
            return jsonify({'message': 'User not found'}), 404
        conn.commit()
    except Exception as e:
        conn.close()
        logger.error(f"Error saving background for {current_user}: {str(e)}")
        return jsonify({'message': 'Error saving background'}), 500
    conn.close()

    logger.info(f"Background selected: {background_url} for user {current_user}")
    return jsonify({'message': 'Background selected successfully', 'background_url': background_url}), 200

@app.route('/get-selected-background', methods=['GET'])
@jwt_required()
def get_selected_background():
    current_user = get_jwt_identity()
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT background FROM users WHERE username = ?', (current_user,))
    result = c.fetchone()
    conn.close()

    if not result or not result[0]:
        return jsonify({'background_url': None}), 200
    return jsonify({'background_url': result[0]}), 200

@app.route('/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    if 'avatar' not in request.files:
        return jsonify({'message': 'No avatar file provided'}), 400

    file = request.files['avatar']
    if not file.filename.endswith(('.jpg', '.png', '.jpeg')):
        return jsonify({'message': 'Only JPG or PNG files are allowed'}), 400

    filename = secure_filename(file.filename)
    file.save(os.path.join(AVATAR_DIR, filename))
    return jsonify({'message': 'Avatar uploaded successfully'}), 200

@app.route('/avatars/<filename>')
def serve_avatar(filename):
    return send_from_directory(AVATAR_DIR, filename)

@app.route('/upload-project', methods=['POST'])
@jwt_required()
def upload_project():
    if 'project-file' not in request.files:
        return jsonify({'message': 'No project file provided'}), 400

    file = request.files['project-file']
    if not file.filename.endswith(('.rar', '.zip', '.7z')):
        return jsonify({'message': 'Only RAR, ZIP, or 7Z files are allowed'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(PROJECT_UPLOAD_DIR, filename)
    file.save(file_path)

    logger.info(f"Project uploaded: filename={filename}")
    return jsonify({'message': 'Project uploaded successfully'}), 200

@app.route('/tracks', methods=['GET'])
def get_tracks():
    logger.info('Received request for /tracks')
    tracks = []
    random_thumbnails = [f for f in os.listdir(RANDOM_THUMBNAIL_DIR) if f.endswith(('.jpg', '.png'))]
    used_thumbnails = set()
    with open(TRACKS_JSON, 'r') as f:
        tracks_data = json.load(f)
    tracks_dict = {track['id']: track for track in tracks_data}

    for filename in os.listdir(MUSIC_DIR):
        if filename.endswith(('.mp3', '.wav')):
            file_path = os.path.join(MUSIC_DIR, filename)
            logger.info(f'Processing file: {filename}')
            try:
                audio = mutagen.mp3.MP3(file_path) if filename.endswith('.mp3') else None
                duration = audio.info.length if audio else 0
                match = re.match(r'.*_(\d{4})\.(mp3|wav)$', filename)
                if match:
                    track_id = match.group(1)
                    track_info = tracks_dict.get(track_id, {})
                    title = track_info.get('name', filename[:-9])
                    artist = track_info.get('artist', title)
                    thumbnail_id = track_info.get('thumbnail_id', '')
                    thumbnail_path = os.path.join(THUMBNAIL_DIR, f'{thumbnail_id}.jpg')
                    thumbnail = f'/thumbnails/{thumbnail_id}.jpg' if thumbnail_id and os.path.exists(thumbnail_path) else None
                    if not thumbnail and random_thumbnails:
                        available_thumbnails = [t for t in random_thumbnails if t not in used_thumbnails]
                        if available_thumbnails:
                            selected_thumbnail = random.choice(available_thumbnails)
                            used_thumbnails.add(selected_thumbnail)
                            thumbnail = f'/randomthumbnail/{selected_thumbnail}'
                        else:
                            thumbnail = 'https://via.placeholder.com/200'
                    else:
                        thumbnail = thumbnail or 'https://via.placeholder.com/200'
                else:
                    title = filename.rsplit('.', 1)[0]
                    artist = title
                    if random_thumbnails:
                        available_thumbnails = [t for t in random_thumbnails if t not in used_thumbnails]
                        if available_thumbnails:
                            selected_thumbnail = random.choice(available_thumbnails)
                            used_thumbnails.add(selected_thumbnail)
                            thumbnail = f'/randomthumbnail/{selected_thumbnail}'
                        else:
                            thumbnail = 'https://via.placeholder.com/200'
                    else:
                        thumbnail = 'https://via.placeholder.com/200'
                tracks.append({
                    'title': title,
                    'artist': artist,
                    'url': f'/music/{filename}',
                    'thumbnail': thumbnail,
                    'duration': duration
                })
            except Exception as e:
                logger.error(f"Error reading {filename}: {str(e)}")
    logger.info(f'Returning tracks: {tracks}')
    return jsonify(tracks), 200

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('q', '').lower()
    query = unidecode(query)
    logger.info(f'Received search request with query: {query}')
    tracks = []
    random_thumbnails = [f for f in os.listdir(RANDOM_THUMBNAIL_DIR) if f.endswith(('.jpg', '.png'))]
    used_thumbnails = set()
    with open(TRACKS_JSON, 'r') as f:
        tracks_data = json.load(f)
    tracks_dict = {track['id']: track for track in tracks_data}

    for filename in os.listdir(MUSIC_DIR):
        if filename.endswith(('.mp3', '.wav')):
            match = re.match(r'.*_(\d{4})\.(mp3|wav)$', filename)
            if match:
                track_id = match.group(1)
                track_info = tracks_dict.get(track_id, {})
                search_title = unidecode(track_info.get('name', filename[:-9]).lower())
            else:
                search_title = unidecode(filename.rsplit('.', 1)[0].lower())

            if query in search_title:
                file_path = os.path.join(MUSIC_DIR, filename)
                logger.info(f'Processing file: {filename}')
                try:
                    audio = mutagen.mp3.MP3(file_path) if filename.endswith('.mp3') else None
                    duration = audio.info.length if audio else 0
                    if match:
                        title = track_info.get('name', filename[:-9])
                        artist = track_info.get('artist', title)
                        thumbnail_id = track_info.get('thumbnail_id', '')
                        thumbnail_path = os.path.join(THUMBNAIL_DIR, f'{thumbnail_id}.jpg')
                        thumbnail = f'/thumbnails/{thumbnail_id}.jpg' if thumbnail_id and os.path.exists(thumbnail_path) else None
                        if not thumbnail and random_thumbnails:
                            available_thumbnails = [t for t in random_thumbnails if t not in used_thumbnails]
                            if available_thumbnails:
                                selected_thumbnail = random.choice(available_thumbnails)
                                used_thumbnails.add(selected_thumbnail)
                                thumbnail = f'/randomthumbnail/{selected_thumbnail}'
                            else:
                                thumbnail = 'https://via.placeholder.com/200'
                        else:
                            thumbnail = thumbnail or 'https://via.placeholder.com/200'
                    else:
                        title = filename.rsplit('.', 1)[0]
                        artist = title
                        if random_thumbnails:
                            available_thumbnails = [t for t in random_thumbnails if t not in used_thumbnails]
                            if available_thumbnails:
                                selected_thumbnail = random.choice(available_thumbnails)
                                used_thumbnails.add(selected_thumbnail)
                                thumbnail = f'/randomthumbnail/{selected_thumbnail}'
                            else:
                                thumbnail = 'https://via.placeholder.com/200'
                        else:
                            thumbnail = 'https://via.placeholder.com/200'
                    tracks.append({
                        'title': title,
                        'artist': artist,
                        'url': f'/music/{filename}',
                        'thumbnail': thumbnail,
                        'duration': duration
                    })
                except Exception as e:
                    logger.error(f"Error reading {filename}: {str(e)}")
    logger.info(f'Returning search results: {tracks}')
    return jsonify(tracks), 200

@app.route('/upload', methods=['POST'])
@jwt_required()
def upload():
    if 'song' not in request.files or 'title' not in request.form:
        return jsonify({'message': 'Missing song file or title'}), 400

    song_file = request.files['song']
    title = request.form['title']
    thumbnail_file = request.files.get('thumbnail')

    if not song_file.filename.endswith(('.mp3', '.wav')):
        return jsonify({'message': 'Only MP3 or WAV files are allowed'}), 400

    if not re.match(r'^[a-zA-Z0-9\s\u00C0-\u1EF9]+$', title):
        return jsonify({'message': 'Invalid title: only letters, numbers, spaces, and Vietnamese characters allowed'}), 400

    with open(TRACKS_JSON, 'r') as f:
        tracks_data = json.load(f)

    existing_ids = {track['id'] for track in tracks_data}
    new_id = generate_unique_id(existing_ids)

    cleaned_title = clean_title_for_filename(title)
    ext = os.path.splitext(song_file.filename)[1].lower()
    song_filename = f"{cleaned_title}_{new_id}{ext}"
    thumbnail_filename = f"{new_id}.jpg"

    random_thumbnails = [f for f in os.listdir(RANDOM_THUMBNAIL_DIR) if f.endswith(('.jpg', '.png'))]
    if thumbnail_file and thumbnail_file.filename.endswith(('.jpg', '.png')):
        thumbnail_file.save(os.path.join(THUMBNAIL_DIR, thumbnail_filename))
    else:
        if random_thumbnails:
            random_thumbnail = random.choice(random_thumbnails)
            with open(os.path.join(RANDOM_THUMBNAIL_DIR, random_thumbnail), 'rb') as src:
                with open(os.path.join(THUMBNAIL_DIR, thumbnail_filename), 'wb') as dst:
                    dst.write(src.read())

    song_path = os.path.join(MUSIC_DIR, song_filename)
    song_file.save(song_path)

    tracks_data.append({
        'id': new_id,
        'name': title,
        'artist': title,
        'thumbnail_id': new_id
    })
    with open(TRACKS_JSON, 'w') as f:
        json.dump(tracks_data, f, indent=2)

    logger.info(f"Upload successful: title={title}, id={new_id}")
    return jsonify({'message': 'Upload successful'}), 200

@app.route('/upload-link', methods=['POST'])
@jwt_required()
def upload_link():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'message': 'No URL provided'}), 400

    logger.info(f"Processing upload-link request with URL: {url}")
    ffmpeg_path = get_ffmpeg_path()
    save_folder = MUSIC_DIR
    thumbnail_folder = THUMBNAIL_DIR

    try:
        download_media(url, ffmpeg_path, output_path=".", save_folder=MUSIC_DIR, thumbnail_folder=THUMBNAIL_DIR, bitrate="320")

        new_files = [f for f in os.listdir(MUSIC_DIR) if f.endswith('.mp3')]
        if not new_files:
            return jsonify({'message': 'No MP3 files were downloaded'}), 500

        with open(TRACKS_JSON, 'r') as f:
            tracks_data = json.load(f)
        existing_ids = {track['id'] for track in tracks_data}

        new_file = max(new_files, key=lambda f: os.path.getctime(os.path.join(MUSIC_DIR, f)))
        new_id = generate_unique_id(existing_ids)
        cleaned_title = clean_title_for_filename(os.path.splitext(new_file)[0])
        new_filename = f"{cleaned_title}_{new_id}.mp3"
        thumbnail_filename = f"{new_id}.jpg"

        os.rename(os.path.join(MUSIC_DIR, new_file), os.path.join(MUSIC_DIR, new_filename))

        new_thumbnails = [f for f in os.listdir(THUMBNAIL_DIR) if f.endswith(('.jpg', '.png'))]
        if new_thumbnails:
            latest_thumbnail = max(new_thumbnails, key=lambda f: os.path.getctime(os.path.join(THUMBNAIL_DIR, f)))
            with open(os.path.join(THUMBNAIL_DIR, latest_thumbnail), 'rb') as src:
                with open(os.path.join(THUMBNAIL_DIR, thumbnail_filename), 'wb') as dst:
                    dst.write(src.read())
        else:
            random_thumbnails = [f for f in os.listdir(RANDOM_THUMBNAIL_DIR) if f.endswith(('.jpg', '.png'))]
            if random_thumbnails:
                random_thumbnail = random.choice(random_thumbnails)
                with open(os.path.join(RANDOM_THUMBNAIL_DIR, random_thumbnail), 'rb') as src:
                    with open(os.path.join(THUMBNAIL_DIR, thumbnail_filename), 'wb') as dst:
                        dst.write(src.read())
            else:
                return jsonify({'message': 'No thumbnail available'}), 500

        tracks_data.append({
            'id': new_id,
            'name': cleaned_title.replace('_', ' ').title(),
            'artist': cleaned_title.replace('_', ' ').title(),
            'thumbnail_id': new_id
        })
        with open(TRACKS_JSON, 'w') as f:
            json.dump(tracks_data, f, indent=2)

        logger.info(f"Link upload successful: title={cleaned_title}, id={new_id}")
        return jsonify({'message': 'Link upload successful'}), 200

    except Exception as e:
        logger.error(f"Error processing link upload: {str(e)}")
        return jsonify({'message': f'Error processing link: {str(e)}'}), 500

@app.route('/background', methods=['POST'])
@jwt_required()
def upload_background():
    if 'file' not in request.files:
        return jsonify({'message': 'Missing file'}), 400

    file = request.files['file']
    if not file.filename.endswith(('.mp4', '.png', '.jpg', '.jpeg')):
        return jsonify({'message': 'Only MP4, PNG, JPG files are allowed'}), 400

    filename = secure_filename(file.filename)
    file.save(os.path.join(BACKGROUND_DIR, filename))
    return jsonify({'message': 'Background uploaded', 'url': f'/backgrounds/{filename}'}), 200

@app.route('/backgrounds', methods=['GET'])
def get_backgrounds():
    backgrounds = []
    for filename in os.listdir(BACKGROUND_DIR):
        if filename.endswith(('.mp4', '.png', '.jpg', '.jpeg')):
            backgrounds.append({
                'name': filename,
                'url': f'/backgrounds/{filename}'
            })
    return jsonify(backgrounds), 200

@app.route('/music/<filename>')
def serve_music(filename):
    return send_from_directory(MUSIC_DIR, filename)

@app.route('/thumbnails/<filename>')
def serve_thumbnail(filename):
    return send_from_directory(THUMBNAIL_DIR, filename)

@app.route('/backgrounds/<filename>')
def serve_background(filename):
    return send_from_directory(BACKGROUND_DIR, filename)

@app.route('/randomthumbnail/<filename>')
def serve_random_thumbnail(filename):
    return send_from_directory(RANDOM_THUMBNAIL_DIR, filename)

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static_file(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 6001))
    context = ('D:\\ur path\\MusicPlayer\\cert.pem', 'D:\\ur path\\MusicPlayer\\key.pem') #change ur path
    app.run(host='0.0.0.0', port=port)