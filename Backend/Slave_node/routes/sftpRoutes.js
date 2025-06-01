import express from 'express';
import { checkConnection, getFileList, renameFile, downloadFile } from '../services/sftpService.js';

const router = express.Router();

// **1️⃣ 设备连通性检测**
router.get('/check-connection', async (req, res) => {
    const { ip } = req.query;
    if (!ip) {
        return res.status(400).json({ success: false, message: "设备 IP 不能为空" });
    }

    try {
        const result = await checkConnection(ip);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// **2️⃣ 获取设备上的文件列表**
router.get('/files', async (req, res) => {
    const { ip } = req.query;
    if (!ip) {
        return res.status(400).json({ success: false, message: "设备 IP 不能为空" });
    }

    try {
        console.log(`Attempting to get file list for IP: ${ip}`);
        const files = await getFileList(ip);
        console.log(`Files retrieved:`, files);
        res.json({ success: true, files });
    } catch (error) {
        console.error("Error fetching file list:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// **3️⃣ 文件重命名**
router.post('/rename', async (req, res) => {
    const { oldFileName, newFileName, ip } = req.body;

    if (!oldFileName || !newFileName || !ip) {
        return res.status(400).json({ success: false, message: "缺少必要参数" });
    }

    try {
        const result = await renameFile(ip, oldFileName, newFileName);
        res.json(result);
    } catch (error) {
        console.error("重命名失败:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// **文件下载**
router.get('/download', async (req, res) => {
    const { ip, fileName } = req.query;
    console.log(`收到下载请求: IP=${ip}, 文件=${fileName}`);

    if (!ip || !fileName) {
        return res.status(400).json({ success: false, message: "设备 IP 和文件名不能为空" });
    }
    try {
        const localPath = await downloadFile(ip, fileName);
        console.log(`文件已下载: ${localPath}`);
        res.download(localPath, fileName);
    } catch (error) {
        console.error("下载失败:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
