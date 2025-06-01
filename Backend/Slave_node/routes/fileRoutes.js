const express = require('express');
const {
    readFile,
    parseMotorDataFromTemp,
    writeMotorDataToTemp,
    parseTouchData,
    parseLastFiveLines,
    writeMotorDataToFile,
    writeTouchDataToFile } = require('../services/fileService');
const config = require("../config");
const router = express.Router();

// 从 temp.txt 读取并解析 test_num 和 yaw_num
router.get('/readMotor', async (req, res) => {
    try {
        const motorData = await parseMotorDataFromTemp();
        res.json(motorData);
        console.log('Motor data from temp.txt sent successfully');
    } catch (err) {
        console.error('Error processing motor data from temp.txt:', err);
        res.status(500).json({ message: 'Failed to read or parse motor data from temp.txt' });
    }
});

// 读取文件并返回最后 5 行
router.get('/displayFile', async (req, res) => {
    try {
        const data = await readFile(config.filePaths.dataFile);
        const lastFiveLines = await parseLastFiveLines(data);
        console.log('last Five Line sent successfully');
        res.json({ lines: lastFiveLines });
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).json({ message: 'Failed to read file' });
    }
});

// 将 test_num 和 yaw_num 写入 temp.txt
router.post('/writeToTemp', async (req, res) => {
    const { test_num, yaw_num } = req.body;

    console.log('Received data:', req.body);

    // 验证数据有效性
    if (typeof test_num !== 'number' || typeof yaw_num !== 'number') {
        return res.status(400).json({ message: 'Invalid data received' });
    }

    try {
        await writeMotorDataToTemp(test_num, yaw_num);
        res.json({ message: 'Data successfully written to temp.txt' });
    } catch (error) {
        console.error('Error writing to temp.txt:', error);
        res.status(500).json({ message: 'Failed to write to temp.txt' });
    }
});

// 接收并写入镖架据
router.post('/writeStand', async (req, res) => {
    const { test_num, yaw_num, yaw_angle, pitch_angle, roll_angle, additionalText } = req.body;

    console.log('Received data:', req.body);

    // 验证数据有效性
    if (typeof test_num !== 'number' || typeof yaw_num !== 'number' || typeof yaw_angle !== 'number' || typeof pitch_angle !== 'number' || typeof roll_angle !== 'number') {
        return res.status(400).json({ message: 'Invalid data received' });
    }

    try {
        await writeMotorDataToFile(req.body); // 调用服务层写入数据
        res.json({ message: 'Data successfully written to file' });
    } catch (error) {
        console.error('Error writing to file:', error);
        res.status(500).json({ message: 'Failed to write to file' });
    }
});

module.exports = router;
