const express = require('express');
const { stm32Data, sendData } = require('../services/serialService');
const { Buffer } = require('buffer');
const router = express.Router();

router.get('/recvStm32', (req, res) => {
    res.json(stm32Data);
});

router.post('/sendStm32', (req, res) => {
    const { TOF, dart_state, test_num, yaw_num, test_last_num, yaw_last_num } = req.body;
    if (
        typeof TOF !== 'number' ||
        typeof dart_state !== 'number' ||
        typeof test_num !== 'number' ||
        typeof yaw_num !== 'number' ||
        typeof test_last_num !== 'number' ||
        typeof yaw_last_num !== 'number'
    ) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    const buffer = Buffer.alloc(18);
    buffer.writeUInt8(TOF, 0);
    buffer.writeUInt8(dart_state, 1);
    buffer.writeFloatLE(test_num, 2);
    buffer.writeFloatLE(yaw_num, 6);
    buffer.writeFloatLE(test_last_num, 10);
    buffer.writeFloatLE(yaw_last_num, 14);

    sendData(buffer, (err) => {
        if (err) return res.status(500).json({ message: 'Failed to send data' });
        res.json({ message: 'Data sent successfully' });
        // console.log('stm32 data sent successfully');
    });
});

module.exports = router;
