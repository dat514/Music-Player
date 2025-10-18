from flask_bcrypt import Bcrypt
import pyperclip

bcrypt = Bcrypt()

new_password = input("password: ")
hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')

print("\nHash for save in DB:")
print(hashed_password)
pyperclip.copy(hashed_password)
print("\n Hash copied to clipboard")
