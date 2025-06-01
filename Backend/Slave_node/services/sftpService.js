import SftpClient from 'ssh2-sftp-client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_DIR = path.join(__dirname, '../downloads'); // 本地存储下载文件目录

// **设备连接配置**
export const createSftpConnection = async (ip) => {
    const sftp = new SftpClient();
    try {
        await sftp.connect({
            host: ip,
            port: 22,
            username: "root",
            password: "root",
        });
        console.log(`SFTP connection established with ${ip}`);
        return sftp;
    } catch (error) {
        console.error(`Error connecting to ${ip}:`, error);
        throw new Error("无法连接到设备: " + error.message);
    }
};

// **检查设备连接**
export const checkConnection = async (ip) => {
    try {
        const sftp = await createSftpConnection(ip);
        await sftp.end();
        return { success: true, message: "设备连接成功" };
    } catch (error) {
        throw new Error("无法访问设备: " + error.message);
    }
};

// **获取文件列表（只返回 .mp4 和 .txt 后缀的文件）**
export const getFileList = async (ip) => {
    try {
        const sftp = await createSftpConnection(ip);
        const DEVICE_PATH = "/root"; // 设备上的文件路径
        const fileList = await sftp.list(DEVICE_PATH);
        await sftp.end();

        // 过滤出以 .mp4 或 .txt 结尾的文件
        const filteredFiles = fileList.filter(file => 
            file.name.endsWith('.mp4') || file.name.endsWith('.txt')
        );
        
        return filteredFiles.map(file => file.name); // 返回过滤后的文件名
    } catch (error) {
        console.error("Error fetching file list:", error);
        throw new Error("获取文件列表失败: " + error.message);
    }
};


// **重命名文件**
export const renameFile = async (ip, oldFileName, newFileName) => {
    try {
        const sftp = await createSftpConnection(ip);
        const DEVICE_PATH = "/root";
        const oldPath = `${DEVICE_PATH}/${oldFileName}`;
        const newPath = `${DEVICE_PATH}/${newFileName}`;

        console.log(`Renaming file: ${oldPath} -> ${newPath}`);

        await sftp.rename(oldPath, newPath);
        await sftp.end();
        console.log(`Rename successful: ${oldPath} -> ${newPath}`);

        return { success: true, message: "文件重命名成功" };
    } catch (error) {
        console.error("文件重命名失败:", error);
        throw new Error("文件重命名失败: " + error.message);
    }
};

// **下载文件**
export const downloadFile = async (ip, fileName) => {
    try {
        const sftp = await createSftpConnection(ip);
        const DEVICE_PATH = "/root";
        const remotePath = `${DEVICE_PATH}/${fileName}`;
        const localPath = path.join(DOWNLOAD_DIR, fileName);

        console.log(`Downloading file: ${remotePath} -> ${localPath}`);

        await sftp.fastGet(remotePath, localPath);
        await sftp.end();

        if (!fs.existsSync(localPath)) {
            throw new Error(`文件未下载成功: ${localPath} 不存在`);
        }

        console.log(`Download successful: ${localPath}`);
        return localPath;
    } catch (error) {
        console.error("下载文件失败:", error);
        throw new Error("下载文件失败: " + error.message);
    }
};
