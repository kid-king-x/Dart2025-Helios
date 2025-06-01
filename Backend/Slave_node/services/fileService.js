/*提供了文件读写的服务*/
const fs = require('fs');
const path = require('path');
const config = require('../config');

// 读取文件内容
const readFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

// 解析 test_num 和 yaw_num 从 temp.txt
const parseMotorDataFromTemp = async () => {
    try {
        // 打印文件路径，确保它是有效的
        // console.log('Reading temp file from:', config.filePaths.tempFile);

        const data = await readFile(config.filePaths.tempFile);
        const lines = data.trim().split('\n');
        const lastLine = lines[lines.length - 1];

        console.log('test_num and yaw_num origin data:',data);

        // 增加空值检查
        if (!lastLine) {
            throw new Error('File is empty or last line is missing');
        }

        const testNumMatch = lastLine.match(/test电机: (\d+)/);
        const yawNumMatch = lastLine.match(/yaw电机: (\d+)/);
        console.log('test_num:',testNumMatch, '   yaw_num:',yawNumMatch);
        // 如果匹配不到则赋值为 0
        const test_num = testNumMatch ? parseFloat(testNumMatch[1]) : 0;
        const yaw_num = yawNumMatch ? parseFloat(yawNumMatch[1]) : 0;

        return { test_num, yaw_num, content: lastLine };
    } catch (error) {
        throw new Error(`Failed to parse motor data from temp file: ${error.message}`);
    }
};

// 解析 dartx 和 darty 坐标从 data.txt
const parseTouchData = async () => {
    try {
        // 打印文件路径，确保它是有效的
        console.log('Reading data file from:', config.filePaths.dataFile);

        const data = await readFile(config.filePaths.dataFile);
        const lines = data.trim().split('\n');
        const lastLine = lines[lines.length - 1];

        // 增加空值检查
        if (!lastLine) {
            throw new Error('File is empty or last line is missing');
        }

        const dartxMatch = lastLine.match(/X落点: (-?[\d.]+)/);
        const dartyMatch = lastLine.match(/Y落点: (-?[\d.]+)/);

        // 如果匹配不到则赋值为 0
        const dartxNum = dartxMatch ? parseFloat(dartxMatch[1]) : 0;
        const dartyNum = dartyMatch ? parseFloat(dartyMatch[1]) : 0;

        return { dart: [dartxNum, dartyNum], content: lastLine };
    } catch (error) {
        throw new Error(`Failed to parse touch data from data file: ${error.message}`);
    }
};

// 解析最后 5 行数据从 data.txt
const parseLastFiveLines = async () => {
    try {
        // 打印文件路径，确保它是有效的
        console.log('Reading data file from:', config.filePaths.dataFile);

        const data = await readFile(config.filePaths.dataFile);
        const lines = data.trim().split('\n').filter(line => line.trim() !== '');
        const latestLines = lines.slice(-5);

        const parsedLines = latestLines.map(line => {
            const testNumMatch = line.match(/test电机: (\d+)/);
            const yawNumMatch = line.match(/yaw电机: (\d+)/);
            const dartxMatch = line.match(/X落点: (-?[\d.]+)/);
            const dartyMatch = line.match(/Y落点: (-?[\d.]+)/);

            return {
                content: line,
                test_num: testNumMatch ? parseFloat(testNumMatch[1]) : null,
                yaw_num: yawNumMatch ? parseFloat(yawNumMatch[1]) : null,
                dartx: dartxMatch ? parseFloat(dartxMatch[1]) : null,
                darty: dartyMatch ? parseFloat(dartyMatch[1]) : null,
            };
        });

        return parsedLines;
    } catch (error) {
        throw new Error(`Failed to parse last five lines from data file: ${error.message}`);
    }
};


// 将 test_num 和 yaw_num 写入 temp.txt
const writeMotorDataToTemp = async (test_num, yaw_num) => {
    return new Promise((resolve, reject) => {
        const timestamp = new Date().toLocaleString();
        const content = `时间: ${timestamp}, test电机: ${test_num}, yaw电机: ${yaw_num}\n`;

        fs.appendFile(config.filePaths.tempFile, content, (err) => {
            if (err) {
                return reject('Failed to write to temp file');
            }
            resolve('Data successfully written to temp file');
        });
    });
};

// 写入电机和角度数据到 data.txt
const writeMotorDataToFile = (data) => {
    return new Promise((resolve, reject) => {
        const { test_num, yaw_num, yaw_angle, pitch_angle, roll_angle, additionalText } = data;
        const timestamp = new Date().toLocaleString();
        const content = `备注: ${additionalText},\n时间: ${timestamp}, test电机: ${test_num}, yaw电机: ${yaw_num}, yaw角度: ${yaw_angle}, pitch角度: ${pitch_angle}, roll角度: ${roll_angle}, `;

        fs.appendFile(config.filePaths.dataFile, content, (err) => {
            if (err) {
                return reject('Failed to write to data file');
            }
            resolve('Data successfully written to data file');
        });
    });
};

// 写入镖体落点数据到 data.txt
const writeTouchDataToFile = async (dartX, dartY) => {
    try {
        // 读取文件内容
        let data = await fs.promises.readFile(config.filePaths.dataFile, 'utf8');

        // 追加新数据
        const content = `X落点: ${dartX}, Y落点: ${dartY}, `;
        await fs.promises.writeFile(config.filePaths.dataFile, data + content, 'utf8');

        console.log('XY Data successfully appended to data file:', content); // 打印成功信息
        return 'Data successfully appended to data file';
    } catch (err) {
        console.error('Error writing to file:', err); // 打印错误信息
        throw new Error('Failed to write to data file');
    }
};

module.exports = {
    readFile,
    parseMotorDataFromTemp,
    parseTouchData,
    writeMotorDataToTemp,
    parseLastFiveLines,
    writeMotorDataToFile,
    writeTouchDataToFile,
};
