const express = require('express');
const { readFile, parseMotorData, parseTouchData, parseLastFiveLines, writeMotorDataToFile, writeTouchDataToFile } = require('../services/fileService');
const config = require("../config");
const router = express.Router();

// 读取镖体落点数据（touch data）
router.get('/readTouch', async (req, res) => {
    try {
        const data = await readFile(config.filePaths.dataFile);
        const touchData = await parseTouchData(data); // 使用 await 等待异步函数的结果
        res.json(touchData);
        console.log('Touch data sent successfully');
    } catch (err) {
        console.error('Error processing touch data:', err);
        res.status(500).json({ message: 'Failed to read or parse touch data' });
    }
});

// 接收并写入镖体落点数据
router.post('/writeToTouch', async (req, res) => {
    const { dartX_value, dartY_value } = req.body;

    console.log('Received Touch data:', req.body);

    const dartX = parseFloat(dartX_value);
    const dartY = parseFloat(dartY_value);

    if (isNaN(dartX) || isNaN(dartY)) {
        return res.status(400).json({ message: 'Invalid dart touch data received' });
    }

    try {
        await writeTouchDataToFile(dartX, dartY); // 调用服务层写入数据
        res.json({ message: 'Data successfully written to file' });
    } catch (error) {
        console.error('Error writing to file:', error);
        res.status(500).json({ message: 'Failed to write to file' });
    }
});

module.exports = router;
