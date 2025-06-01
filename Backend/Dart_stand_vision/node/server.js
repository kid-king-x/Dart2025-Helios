import express from 'express';
import cors from 'cors';
import http from 'http';
import sharp from 'sharp';
import { Server } from 'socket.io';
// import config from './config.js';
import multer from 'multer';
const port = 3000;
// 创建 Express 实例
const app = express();
app.use(express.static('public'));
const storage = multer.memoryStorage(); // 文件保存在内存中
const upload = multer({ storage: storage });

const server = http.createServer(app);
const io = new Server(server);



// 允许跨域请求
// app.use(cors);
app.use(express.json());

// 上传图像接口
app.post('/standCamera', upload.single('image'), (req, res) => {
    if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).send('No file uploaded.');
    }

    console.log('File uploaded successfully');
    console.log('File size:', req.file.size);  // 打印文件大小

    // 使用sharp库进行图像处理（例如调整大小）
    sharp(req.file.buffer)
        .resize(640, 480)
        .toBuffer()
        .then(data => {
            console.log('Processed image data size:', data.length);  // 打印处理后的图像数据的大小

            // 发送处理后的图像给所有连接的客户端
            io.emit('image', data);  // 广播到所有客户端

            res.status(200).send('Image processed and sent to clients');
        })
        .catch(err => {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
        });
});
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
