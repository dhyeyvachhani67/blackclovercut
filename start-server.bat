@echo off
title BlackClovercut AI Server
cd /d "%~dp0"

echo ======================================================
echo   Starting BlackClovercut AI Server...
echo ======================================================
echo.

set "PATH=C:\Program Files\nodejs;C:\Users\NRI INFOTECH\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin;C:\Users\NRI INFOTECH\AppData\Local\Microsoft\WinGet\Packages\yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe;%PATH%"

echo Opening http://localhost:5000 in your browser...
start http://localhost:5000

node server/index.js
pause
