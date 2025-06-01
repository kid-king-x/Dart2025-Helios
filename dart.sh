#!/bin/bash

# 启动 Node.js 服务
node ./Backend/Slave_node/app.js &

# 切换到 C++ server 的目录并启动 server
(
    cd ./Backend/Dart_stand_vision/dart_recognition/build || exit 1
    ./test_hikvision &
)

# 等待 2 秒，确保服务器启动
sleep 2

# 使用 xdg-open 打开浏览器访问本地服务器
xdg-open http://localhost:3000