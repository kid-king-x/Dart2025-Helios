import sharp from 'sharp';
import { Server } from 'socket.io';

const processImage = async (fileBuffer, io) => {
    console.log('Sending image data to clients');
    try {
        const processedBuffer = await sharp(fileBuffer)
            .resize(640, 480)
            .toBuffer();

        //console.log('Processed image data size:', processedBuffer.length);
        //console.log('Sending image data to clients');

        // 发送图像数据到所有客户端
        io.emit('image', processedBuffer);

        return processedBuffer;
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
};


export { processImage };
