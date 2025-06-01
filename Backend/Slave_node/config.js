const path = require('path');
module.exports = {
    port: 3000,
    serialPort: {
        path: process.platform === 'win32' ? 'COM4' : '/dev/ttyACM0',
        baudRate: 9600,
        autoOpen: true,
    },
    filePaths: {
        dataFile: path.join(__dirname, 'data.txt'), // 每次发射的文件存储路径
        tempFile: path.join(__dirname, 'temp.txt'), // distance电机和yaw电机的存储路径
    },
};
