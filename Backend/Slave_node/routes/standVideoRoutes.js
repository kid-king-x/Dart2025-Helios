import express from 'express';
import multer from 'multer';
import { processImage } from '../services/standVideoService.js';

export default function standVideoRoutes(io) { 
    const router = express.Router();
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });

    router.post('/standCamera', upload.single('image'), async (req, res) => {
        //console.log("Received POST request to /standCamera"); // 确保请求到达后端
        
        if (!req.file) {
            console.log("No file uploaded");
            return res.status(400).send('No file uploaded.');
        }

        //console.log('File uploaded successfully');
        //console.log('File size:', req.file.size);

        try {
            await processImage(req.file.buffer, io);
            res.status(200).send('Image processed and sent to clients');
            //console.log('Received file:', req.file);
            //console.log('File buffer length:', req.file?.buffer.length);
        } catch (error) {
            //console.error('Error processing image:', error);
            res.status(500).send('Error processing image');
        }
    });

    return router;
}
