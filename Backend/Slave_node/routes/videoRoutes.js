import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const videoDir = path.join(__dirname, '../downloads'); // 适配正确路径

// 获取 MP4 文件列表
router.get('/mp4-list', (req, res) => {
  fs.readdir(videoDir, (err, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: '无法读取文件夹' });
    }
    const mp4Files = files.filter(file => file.endsWith('.mp4'));
    res.json({ success: true, files: mp4Files });
  });
});

// 视频流接口（可选）
router.get('/stream/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const videoPath = path.join(videoDir, fileName);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('File not found');
  }

  // 支持分片加载
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(videoPath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });

    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(videoPath).pipe(res);
  }
});

export default router;
