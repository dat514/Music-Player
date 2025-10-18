import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

CLOUDFLARE_URL_FILE = r"D:\LanguageFile\ServerMusicSong\RunAndUpdateLink\cloudflare_url.txt"
PENDING_USERS_FILE = r"D:\LanguageFile\ServerMusicSong\pending_users.txt"

def get_api_url():
    if os.path.exists(CLOUDFLARE_URL_FILE):
        try:
            with open(CLOUDFLARE_URL_FILE, "r", encoding="utf-8") as f:
                url = f.read().strip()
                print(f"Found URL in cloudflare_url.txt: {url}")
                return url
        except Exception as e:
            print(f"Error reading {CLOUDFLARE_URL_FILE}: {e}")
    url = input("Enter API URL (e.g., https://abc123.trycloudflare.com): ").strip()
    if not url:
        print("No URL provided, using fallback: http://127.0.0.1:6001")
        return "http://127.0.0.1:6001"
    return url

def login_admin(username, password, api_url):
    try:
        response = requests.post(
            api_url + "/login",
            headers={"Content-Type": "application/json"},
            json={"username": username, "password": password},
            verify=False  
        )
        response.raise_for_status()
        data = response.json()
        if "token" in data:
            print("Login successful!")
            return data["token"]
        else:
            print(f"Login failed: {data.get('message', 'No token returned')}")
            return None
    except requests.RequestException as e:
        print(f"Error during HTTPS login: {e}")
    
    if api_url.startswith("https://"):
        http_url = api_url.replace("https://", "http://")
        print(f"Retrying with HTTP: {http_url}")
        try:
            response = requests.post(
                http_url + "/login",
                headers={"Content-Type": "application/json"},
                json={"username": username, "password": password}
            )
            response.raise_for_status()
            data = response.json()
            if "token" in data:
                print("Login successful!")
                return data["token"]
            else:
                print(f"Login failed: {data.get('message', 'No token returned')}")
                return None
        except requests.RequestException as e:
            print(f"Error during HTTP login: {e}")
    return None

def get_pending_users():
    if not os.path.exists(PENDING_USERS_FILE):
        print(f"{PENDING_USERS_FILE} does not exist.")
        return []
    try:
        with open(PENDING_USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {PENDING_USERS_FILE}: {e}")
        return []

def verify_user(email, token, api_url):
    try:
        response = requests.post(
            api_url + "/verify",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            },
            json={"email": email},
            verify=False  
        )
        response.raise_for_status()
        data = response.json()
        print(f"Verification result for {email}: {data.get('message')}")
        return True
    except requests.RequestException as e:
        print(f"Error verifying {email}: {e}")
        try:
            if response.status_code == 403:
                print("Unauthorized: Admin access required")
            elif response.status_code == 404:
                print("Email not found in pending users")
        except NameError:
            pass
        return False

def main():
    api_url = get_api_url()
    print(f"Using API URL: {api_url}")

    username = input("Enter admin username (default: admin): ") or "admin"
    password = input("Enter admin password: ") or "admin_password"

    token = login_admin(username, password, api_url)
    if not token:
        print("Cannot proceed without a valid token.")
        return

    pending_users = get_pending_users()
    if not pending_users:
        print("No pending users found.")
        return

    print("\nPending users:")
    for i, user in enumerate(pending_users, 1):
        print(f"{i}. Username: {user['username']}, Email: {user['email']}")

    choice = input("\nEnter 'all' to verify all users, or a number to verify a specific user: ").strip()

    if choice.lower() == "all":
        for user in pending_users:
            verify_user(user["email"], token, api_url)
    else:
        try:
            index = int(choice) - 1
            if 0 <= index < len(pending_users):
                verify_user(pending_users[index]["email"], token, api_url)
            else:
                print("Invalid user number.")
        except ValueError:
            print("Invalid input. Please enter 'all' or a valid number.")

if __name__ == "__main__":
    main()