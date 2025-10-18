@echo off
echo Starting Flask server...
start "Flask Server" cmd /k "cd /d D:\LanguageFile\ServerMusicSong && python app.py"

timeout /t 8 >nul

echo Running ngrok URL updater...
start "Update URL" cmd /k "python update_cloudflare_url.py"

timeout /t 8 >nul

echo Starting bot.py...
start "Bot Script" cmd /k "cd /d D:\LanguageFile\ServerMusicSong\RunAndUpdateLink && python bot.py"
