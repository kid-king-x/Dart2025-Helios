const { SerialPort } = require('serialport');
const { Buffer } = require('buffer');
const config = require('../config');

let stm32Data = {
    yaw: 0,
    pitch: 0,
    roll: 0,
    acc: [0, 0, 0],
    distance_m: 0,
    dart_game_state:0,
};

// 配置串口
const serial = new SerialPort({
    path: config.serialPort.path,    // 使用 config.serialPort.path
    baudRate: config.serialPort.baudRate, // 使用 config.serialPort.baudRate
    autoOpen: config.serialPort.autoOpen, // 自动打开（如果需要）
});

//接收来自stm32的数据
serial.on('data', (data) => {
    if (data.length === 33 && data[0] === 0x5A) {
        const buffer = Buffer.from(data);
        try {
            stm32Data.yaw = buffer.readFloatLE(1);
            stm32Data.pitch = buffer.readFloatLE(5);
            stm32Data.roll = buffer.readFloatLE(9);
            stm32Data.acc = [
                buffer.readFloatLE(13),
                buffer.readFloatLE(17),
                buffer.readFloatLE(21),
            ];
            stm32Data.distance_m = buffer.readFloatLE(25);
            stm32Data.dart_game_state = buffer.readFloatLE(29);
            // console.log('receive stm32 data successfully:', stm32Data);
        } catch (err) {
            console.error('Error parsing data:', err);
        }
    } else {
        //console.log('Invalid Data:', data);
    }
});

//发送传给stm32的数据
const sendData = (buffer, callback) => {
    serial.write(buffer, callback);
};

module.exports = { stm32Data, sendData };
