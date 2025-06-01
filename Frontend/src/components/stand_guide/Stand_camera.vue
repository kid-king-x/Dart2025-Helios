<template>
  <div>
    <h2>引导灯圆心：</h2>
    <ul>
      <li v-for="(circle, index) in circles" :key="index">
        中心： ({{ circle.center[0] }}, {{ circle.center[1] }}), 半径：{{ circle.radius }}
      </li>
    </ul>

    <button @click="startGuide">开始镖架制导</button>
    <button @click="stopGuide">停止镖架制导</button>
    <!-- 显示图像 -->
    <div class="image-container">
      <img ref="videoStream" width="640" height="480" alt="Camera Stream" />
      <div class="crosshair"></div> <!-- 十字线 -->
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { io } from 'socket.io-client';

export default {
  setup: function () {
    const videoStream = ref(null); // 用于显示图像的 <img> 元素
    const circles = ref([]); // 存储圆的半径和中心坐标
    const testLastNum = ref(0); // 存储当前的 test 电机数据
    const yawLastNum = ref(0); // 存储当前的 yaw 电机数据
    let socket = null; // Socket.IO 实例
    let guideInterval = null; // 用于存储 setInterval 的 ID

    // 获取最后一行的电机数据，并保存在 oldData 中
    const fetchLastLine = async () => {
      try {
        const response = await fetch("http://localhost:3000/file/readMotor");
        const data = await response.json();

        // 更新旧数据显示
        testLastNum.value = data.test_num;
        yawLastNum.value = data.yaw_num;
      } catch (error) {
        console.error("Error fetching last line:", error);
        return null;
      }
    };

    // 检查电机值是否在范围内
    const checkMotorRange = (value, min, max) => {
      if (value < min) {
        alert(`电机值不能小于 ${min}，已自动调整为 ${min}`);
        return min;
      } else if (value > max) {
        alert(`电机值不能大于 ${max}，已自动调整为 ${max}`);
        return max;
      }
      return value;
    };

    // 发送数据到后端
    const sendData = async (currentTestNum, currentYawNum) => {
      const min_test_num = 0;
      const max_test_num = 20000;
      const min_yaw_num = 0;
      const max_yaw_num = 6700;

      // 检查范围
      currentTestNum = checkMotorRange(currentTestNum, min_test_num, max_test_num);
      currentYawNum = checkMotorRange(currentYawNum, min_yaw_num, max_yaw_num);

      const data = {
        TOF: 0x5a,
        dart_state: 1,
        test_num: currentTestNum,
        yaw_num: currentYawNum,
        test_last_num: testLastNum.value,
        yaw_last_num: yawLastNum.value,
      };

      try {
        // 发送数据到后端
        await fetch('http://localhost:3000/stm32/sendStm32', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data),
        });

        // 更新当前的电机数据
        testLastNum.value = currentTestNum;
        yawLastNum.value = currentYawNum;

        // 将 test_num 和 yaw_num 写入 temp.txt
        await fetch('http://localhost:3000/file/writeToTemp', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            test_num: currentTestNum,
            yaw_num: currentYawNum,
          }),
        });

        console.log('Data successfully sent and written to temp.txt');
      } catch (error) {
        console.error('Error sending data:', error);
      }
    };

    // 镖架制导逻辑
    const startGuide = () => {
      if (guideInterval) {
        console.warn('Guide is already running');
        return;
      }

      guideInterval = setInterval(async () => {
        fetchLastLine();
        if (circles.value.length > 0) {
          const circle = circles.value[0]; // 获取第一个圆的数据
          const centerX = circle.center[0]; // 圆心中心 x 坐标
          const targetX = 20; // 摄像头安装误差
          const deltaX = centerX - targetX; // 计算差值

          console.log(`Current centerX: ${centerX}, DeltaX: ${deltaX}`);

          if (Math.abs(deltaX) < 1) {
            // 差值小于 1，停止循环
            stopGuide();
            console.log('Guide completed: DeltaX is less than 1');
            return;
          }

          // 更新 yaw_num
          const currentTestNum = testLastNum.value;
          const currentYawNum = yawLastNum.value + deltaX;

          // 发送数据
          await sendData(currentTestNum, currentYawNum);
        } else {
          console.warn('No circles detected');
        }
      }, 100); // 每 100ms 检查一次
    };

    // 停止镖架制导
    const stopGuide = () => {
      if (guideInterval) {
        clearInterval(guideInterval);
        guideInterval = null;
        console.log('Guide stopped');
      }
    };

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
        const blob = new Blob([arrayBufferView], {type: 'image/jpeg'});
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
      stopGuide(); // 确保停止循环
    });

    return {
      videoStream,
      circles,
      fetchLastLine,
      startGuide,
      stopGuide,
    };
  },
};
</script>

<style scoped>
.image-container {
  position: relative;
  width: 640px;
  height: 480px;
}

.crosshair {
  position: absolute;
  top: 0%;
  left: 50%;
  width: 2px;
  height: 100%;
  background-color: red;
  transform: translateX(-50%);
}

.crosshair::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: red;
  transform: translate(-50%, -50%);
}
</style>