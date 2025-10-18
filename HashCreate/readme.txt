Requirement:
Flask
Flask-Bcrypt
pyperclip
DB Browser for SQLite
______________________________________

Run the script → enter your new password.

Flask-Bcrypt hashes the password securely.

pyperclip copies the hash to your clipboard.

Open users.db using DB Browser for SQLite.

Go to Browse Data tab → find the user → replace the old hash with the new one.

Save changes → your password is now updated in the database.
