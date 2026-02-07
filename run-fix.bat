@echo off
cd /d "d:\Works\Febin\web\nexavelosai\backend"
echo Running fix from: %CD%
node -r dotenv/config "../fix-inconsistent-data.js"
pause
