import re
import os
import subprocess
import platform
import time
import requests

project_dir = r"D:\LanguageFile\ServerMusicSong"
log_dir = os.path.join(project_dir, "RunAndUpdateLink")
url_log_file = os.path.join(log_dir, "cloudflare_url.txt")
env_file = os.path.join(project_dir, ".env")

js_files = [
    os.path.join(project_dir, "static", "dashboard.js"),
    os.path.join(project_dir, "static", "script.js"),
    os.path.join(project_dir, "app.py")
]

def get_cloudflare_url_from_terminal():
    try:
        requests.get("http://localhost:6001", timeout=5)
        print("Server at http://localhost:6001 is running")
    except requests.exceptions.RequestException as e:
        print(f"Error: Server at http://localhost:6001 is not running: {e}")
        return None

    try:
        process = subprocess.Popen(
            ["cmd", "/c", "cloudflared", "tunnel", "--url", "http://localhost:6001"],
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8'
        )
        start_time = time.time()
        timeout = 60  

        while time.time() - start_time < timeout:
            line = process.stdout.readline()
            if not line and process.poll() is not None:
                break
            if line:
                print(f"cloudflared output: {line.strip()}")
                match = re.search(r"https://[a-z0-9-]+\.trycloudflare\.com", line)
                if match:
                    url = match.group(0)
                    print(f"Found Cloudflare URL: {url}")
                    process.terminate()
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        print("cloudflared process killed after timeout")
                    return url
            time.sleep(0.1)

        print("Error: No Cloudflare URL found in command output")
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            print("cloudflared process killed after timeout")
        return None

    except FileNotFoundError:
        print("Error: cloudflared executable not found. Ensure it is installed and added to PATH.")
        return None
    except Exception as e:
        print(f"Error: Failed to get URL from Cloudflare: {e}")
        return None
    finally:
        try:
            process.terminate()
            process.wait(timeout=5)
        except (NameError, subprocess.TimeoutExpired):
            pass

def read_old_url():
    try:
        if os.path.exists(url_log_file):
            with open(url_log_file, "r") as f:
                return f.read().strip()
        return None
    except Exception as e:
        print(f"Error reading {url_log_file}: {e}")
        return None

def write_new_url(new_url):
    try:
        os.makedirs(log_dir, exist_ok=True)
        with open(url_log_file, "w") as f:
            f.write(new_url)
        current_link_file = os.path.join(log_dir, "current_link.txt")
        with open(current_link_file, "w") as f:
            f.write(new_url)
    except Exception as e:
        print(f"Error writing URL to files: {e}")

def replace_url_in_file(filepath, old_url, new_url):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        new_content = content.replace(old_url, new_url)
        if new_content != content:
            print(f"Replacing {old_url} with {new_url} in {filepath}")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
    except Exception as e:
        print(f"Error: Failed to update {filepath}: {e}")

def find_url_in_file(filepath):
    pattern = r'https://[a-z0-9-]+\.(ngrok-free\.app|trycloudflare\.com)'
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        match = re.search(pattern, content)
        return match.group(0) if match else None
    except Exception as e:
        print(f"Error: Failed to read {filepath}: {e}")
        return None

def update_env_file(new_url):
    if not os.path.exists(env_file):
        print(f"Warning: .env file not found at {env_file}")
        return
    try:
        with open(env_file, "r", encoding="utf-8") as f:
            lines = f.readlines()

        new_ngrok_line = f"NGROK_URL={new_url}\n"
        new_cors_line = f"CORS_ORIGINS={new_url}\n"

        updated_lines = []
        found_ngrok = False
        found_cors = False

        for line in lines:
            if line.startswith("NGROK_URL="):
                updated_lines.append(new_ngrok_line)
                found_ngrok = True
            elif line.startswith("CORS_ORIGINS="):
                updated_lines.append(new_cors_line)
                found_cors = True
            else:
                updated_lines.append(line)

        if not found_ngrok:
            updated_lines.append(new_ngrok_line)
        if not found_cors:
            updated_lines.append(new_cors_line)

        with open(env_file, "w", encoding="utf-8") as f:
            f.writelines(updated_lines)
        print(f"Updated NGROK_URL and CORS_ORIGINS in {env_file}")
    except Exception as e:
        print(f"Error: Failed to update .env file: {e}")

def copy_to_clipboard(text):
    try:
        if platform.system() == "Windows":
            subprocess.run("clip", universal_newlines=True, input=text)
        else:
            print("Clipboard copy not supported on this OS.")
    except Exception as e:
        print(f"Error: Failed to copy to clipboard: {e}")

def main():
    print("Fetching Cloudflare URL...")
    print(f"Project directory: {project_dir}")
    print(f"Log directory: {log_dir}")
    if not os.path.exists(log_dir):
        print(f"Error: Log directory {log_dir} does not exist")
        return
    new_url = get_cloudflare_url_from_terminal()
    if not new_url:
        print("Warning: Cloudflare URL not found.")
        return
    print(f"New URL: {new_url}")

    old_url = read_old_url()
    print(f"Old URL from log: {old_url}")
    if not old_url:
        print("No previous URL found. Searching for old URL directly in files...")
        for filepath in js_files:
            if not os.path.exists(filepath):
                print(f"Error: File {filepath} does not exist")
                continue
            old_url = find_url_in_file(filepath)
            if old_url:
                print(f"Found old URL in {filepath}: {old_url}")
                break

    if not old_url:
        print("Error: Could not find any old Cloudflare URL to replace.")
        return

    for filepath in js_files:
        if not os.path.exists(filepath):
            print(f"Error: File {filepath} does not exist")
            continue
        replace_url_in_file(filepath, old_url, new_url)
        print(f"Replaced URL in {filepath}")

    update_env_file(new_url)
    write_new_url(new_url)
    copy_to_clipboard(new_url)
    print(f"New URL saved to {url_log_file}")
    print(f"Also saved to current_link.txt")
    print(f"New URL copied to clipboard: {new_url}")

if __name__ == "__main__":
    main()