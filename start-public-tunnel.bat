@echo off
title BlackClovercut AI - Public Internet Tunnel
cd /d "%~dp0"

echo ======================================================
echo   Launching Global Public Tunnel for BlackClovercut AI...
echo ======================================================
echo.
echo Forwarding http://localhost:5000 to a secure HTTPS link...
echo.

"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:5000
pause
