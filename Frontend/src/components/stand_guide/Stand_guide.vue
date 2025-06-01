<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { io } from 'socket.io-client';
import { useRouter } from "vue-router"; // 引入 Vue Router

export default {
  setup() {
    const router = useRouter(); // 获取路由实例
    const videoStream = ref(null); // 用于显示图像的 <img> 元素
    const circles = ref([]); // 存储圆的半径和中心坐标
    let socket = null; // Socket.IO 实例

    onMounted(() => {
      // 连接到 WebSocket 服务器
      socket = io('http://localhost:3000');

      // 监听连接成功事件
      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      // 监听后端发送的图像和圆的数据
      socket.on('image', (data) => {
        console.log('Received image and circles data:', data);

        // 检查图像数据
        if (!data.image) {
          console.error('No image data received');
          return;
        }

        // 如果 data.image 是 base64 字符串
        const base64Data = data.image.replace(/^data:image\/jpeg;base64,/, ''); // 去掉前缀
        const binaryData = atob(base64Data); // 解码 base64
        const arrayBufferView = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          arrayBufferView[i] = binaryData.charCodeAt(i);
        }

        // 创建 Blob 对象
        const blob = new Blob([arrayBufferView], { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);

        // 更新图像
        if (videoStream.value) {
          videoStream.value.src = imageUrl;
          console.log('Image src updated:', videoStream.value.src);
        }

        // 更新圆的信息
        circles.value = data.circles;
      });

      // 监听断开连接事件
      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });
    });

    // 组件卸载时断开 WebSocket 连接
    onBeforeUnmount(() => {
      if (socket) {
        socket.disconnect();
      }
    });

    return { videoStream, circles };
  },
};
</script>



<template>
  <div @click="getClickPosition" class="stand_guide">
    <div class="stand_camera">
      <img :src="videoStreamUrl" alt="Camera Stream" ref="imageRef" />
    </div>

    <div class="camera_center">
      <p v-if="clickPosition">点击坐标: X: {{ clickPosition.x }}, Y: {{ clickPosition.y }}</p>
    </div>
  </div>
</template>

<style scoped>
img {
  width: 1280px;
  height: 1024px;
}
.stand_guide {
  display: flex;
  flex-direction: row;
}
.stand_camera {
  flex: 5;
}
.camera_center {
  flex: 2;
}
</style>
