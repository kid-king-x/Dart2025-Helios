import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import config from './config.js';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import fileRoutes from './routes/fileRoutes.js';
import touchRoutes from './routes/touchRoutes.js';
import stm32Routes from './routes/stm32Routes.js';
import sftpRoutes from './routes/sftpRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import angleRoutes from './routes/angleRoutes.js';

// 创建 Express 实例
const app = express();
const server = http.createServer(app);

// 配置 Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",  // 允许所有来源访问
        methods: ["GET", "POST"]
    }
});

// 配置 multer 用于处理文件上传
const storage = multer.memoryStorage(); // 文件保存在内存中
const upload = multer({ storage: storage });

// 允许跨域请求
app.use(cors({
    origin: "*",  // 允许所有来源访问
    methods: ["GET", "POST"]
}));
app.use(express.json());

// 静态文件目录
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, '../../Frontend/dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  // 上传的文件
app.use('/videos', express.static(path.join(__dirname, './downloads')));  // 直接提供 mp4 文件

// 路由
app.use('/file', fileRoutes);
app.use('/touch', touchRoutes);
app.use('/stm32', stm32Routes);
app.use('/sftp', sftpRoutes);
app.use('/video', videoRoutes);  // 视频相关路由
app.use('/angle', angleRoutes);

// 上传图像接口
app.post('/standCamera', upload.single('image'), (req, res) => {
    if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).send('No file uploaded.');
    }

    // 解析圆的半径和中心坐标
    const circlesData = req.body.circles ? JSON.parse(req.body.circles) : [];
    //console.log('Received circles data:', circlesData);

    // 使用 sharp 库进行图像处理，调整大小
    sharp(req.file.buffer)
        .resize(640, 480)
        .toBuffer()
        .then(data => {
            //console.log('Processed image data size:', data.length);  // 打印处理后的图像数据的大小

            // 发送处理后的图像和圆的数据给所有连接的客户端
            io.emit('image', {
                image: data.toString('base64'), // 将图像转换为 base64 字符串
                circles: circlesData // 发送圆的半径和中心坐标
            });

            res.status(200).send('Image and circles data processed and sent to clients');
        })
        .catch(err => {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
        });
});

// 启动服务器
server.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});