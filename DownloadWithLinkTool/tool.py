import os
import subprocess
import glob
import requests
import re

CONFIG_FILE = "ffmpeg_path.txt"

def get_ffmpeg_path():
    if os.path.isfile(CONFIG_FILE):
        saved_path = open(CONFIG_FILE, 'r', encoding='utf-8').read().strip()
        if os.path.isfile(saved_path) and os.path.basename(saved_path).lower() == 'ffmpeg.exe':
            print(f"Using saved ffmpeg path: {saved_path}")
            return saved_path
    while True:
        path = input("Enter full path to ffmpeg executable: ").strip()
        if os.path.isfile(path) and os.path.basename(path).lower() == 'ffmpeg.exe':
            with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
                f.write(path)
            return path

def safe_filename(name):
    name = re.sub(r'[<>:"/\\|?*]', '', name)
    name = name.strip()
    return name

def convert_to_mp3(ffmpeg_path, input_file, output_file, bitrate="320"):
    ffmpeg_cmd = [
        ffmpeg_path,
        '-i', input_file,
        '-af', 'loudnorm,volume=+6dB,highpass=f=40,lowpass=f=15000',
        '-b:a', f'{bitrate}k',
        '-y', output_file
    ]
    try:
        subprocess.run(ffmpeg_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        print(f"Converted {input_file} to {output_file}")
    except subprocess.CalledProcessError as e:
        print(f"Error converting {input_file}: {e.stderr}")

def download_thumbnail(url, save_path):
    if url:
        try:
            resp = requests.get(url, stream=True)
            if resp.status_code == 200:
                with open(save_path, 'wb') as f:
                    for chunk in resp.iter_content(1024):
                        f.write(chunk)
                print(f"Thumbnail saved: {save_path}")
            else:
                print(f"Failed to download thumbnail: HTTP {resp.status_code}")
        except Exception as e:
            print(f"Error downloading thumbnail: {str(e)}")

def download_media(url, ffmpeg_path, output_path=".", save_folder="Audio MP3", thumbnail_folder="thumbnail Song Down Load", bitrate="320"):
    save_path = os.path.join(output_path, save_folder)
    os.makedirs(save_path, exist_ok=True)
    thumb_path = os.path.join(output_path, thumbnail_folder)
    os.makedirs(thumb_path, exist_ok=True)
    temp_path = os.path.join(output_path, "temp_download")
    os.makedirs(temp_path, exist_ok=True)

    downloader = 'yt-dlp'
    try:
        info_cmd = [downloader, '--get-title', '--get-thumbnail', url]
        info_result = subprocess.run(info_cmd, capture_output=True, text=True, check=True)
        info_lines = info_result.stdout.strip().split('\n')
        title = info_lines[0] if info_lines else 'downloaded_media'
        thumbnail_url = info_lines[1] if len(info_lines) > 1 else ''

        title_safe = safe_filename(title)

        temp_file = os.path.join(temp_path, f"%(title)s.%(ext)s")
        download_cmd = [
            downloader,
            '-f', 'bestaudio/best',
            '-o', temp_file,  
            '--ffmpeg-location', os.path.dirname(ffmpeg_path),
            '--no-playlist',
            url
        ]
        subprocess.run(download_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        print("Download completed")

        audio_files = []
        for ext in ['webm', 'm4a', 'mp3', 'opus']:
            audio_files.extend(glob.glob(os.path.join(temp_path, f'*.{ext}')))

        if not audio_files:
            raise FileNotFoundError("No downloaded files found.")

        for downloaded_file in audio_files:
            title_no_ext = os.path.splitext(os.path.basename(downloaded_file))[0]
            title_safe_file = safe_filename(title_no_ext)
            final_file = os.path.join(save_path, f"{title_safe_file}.mp3")
            convert_to_mp3(ffmpeg_path, downloaded_file, final_file, bitrate)
            os.remove(downloaded_file)

            if thumbnail_url:
                thumb_file = os.path.join(thumb_path, f"{title_safe_file}.jpg")
                download_thumbnail(thumbnail_url, thumb_file)
                with open(os.path.join(thumb_path, "thumbnails.txt"), 'a', encoding='utf-8') as f:
                    f.write(f"{title_safe_file}: {thumbnail_url}\n")

            print(f"Processed: {final_file}")

        print(f"All downloads and conversions completed in folder: {save_path}")
        print(f"Thumbnails saved in folder: {thumb_path}")

    except subprocess.CalledProcessError as e:
        print(f"Error during download: {e.stderr}")
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        for file in glob.glob(os.path.join(temp_path, '*')):
            try:
                os.remove(file)
            except:
                pass
        try:
            os.rmdir(temp_path)
        except:
            pass

if __name__ == "__main__":
    ffmpeg_path = get_ffmpeg_path()
    url = input("Enter YouTube or SoundCloud URL: ").strip()
    if url:
        download_media(url, ffmpeg_path, output_path=".", save_folder="Audio MP3")
