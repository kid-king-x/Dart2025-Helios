@echo off

:: 启动 Node.js 程序
start "" node app.js

:: 等待 3 秒以确保服务启动（根据实际启动时间调整）
timeout /t 3 /nobreak >nul

:: 打开默认浏览器访问 localhost:3000
start "" http://localhost:3000

:: 保持命令提示符窗口打开（可选）
pause
