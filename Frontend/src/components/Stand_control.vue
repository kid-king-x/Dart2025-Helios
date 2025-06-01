<script>
import { useRouter } from "vue-router"; // 引入 useRouter
import { ref, onMounted, onBeforeUnmount , watch } from "vue";
import { io } from 'socket.io-client';

export default {
  name: "Stand_control",
  setup() {
    const testLastNum = ref("-"); // 显示旧数据
    const yawLastNum = ref("-");
    
    const testNum = ref(testLastNum.value);
    const yawNum = ref(yawLastNum.value);

    const dart_state = ref(0);
    const ackValue = ref(0); // 存储 ack 值
    const yaw = ref("-"); // 陀螺仪数据
    const pitch = ref("-");
    const roll = ref("-");
    const acc = ref({ x: "-", y: "-", z: "-" });
    const distance_m = ref("-");//存储测距
    const dart_game_state = ref("-");//用于存储飞飙上场状态
    // 用于存储获取到的旧数据
    let oldData = ref(null);

    // 用于保存文本框内容
    const additionalText = ref("");

    const router = useRouter(); // 获取路由实例

    const videoStream = ref(null); // 用于显示图像的 <img> 元素
    const circles = ref([]); // 存储圆的半径和中心坐标
    let socket = null; // Socket.IO 实例
    let guideInterval = null; // 用于存储 setInterval 的 ID
    const deltaX = ref(0);
    // 获取实时数据
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/stm32/recvStm32");
        const data = await response.json();

        yaw.value = ((data.yaw) / 3.1415926535487 * 180.0).toFixed(4);
        pitch.value = ((data.pitch) / 3.1415926535487 * 180.0).toFixed(4);
        roll.value = ((data.roll) / 3.1415926535487 * 180.0).toFixed(4);
        acc.value = {
          x: data.acc[0].toFixed(5),
          y: data.acc[1].toFixed(5),
          z: data.acc[2].toFixed(5),
        };
        distance_m.value = data.distance_m.toFixed(2);
        dart_game_state.value = data.dart_game_state.toFixed(2);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // 获取最后一行的电机数据，并保存在 oldData 中
    const fetchLastLine = async () => {
      try {
        const response = await fetch("http://localhost:3000/file/readMotor");
        const data = await response.json();

        // 更新旧数据显示
        testLastNum.value = data.test_num.toFixed(2);
        yawLastNum.value = data.yaw_num.toFixed(2);

        oldData.value = data; // 保存旧数据

        return data; // 返回旧数据供后续操作使用
      } catch (error) {
        console.error("Error fetching last line:", error);
        return null;
      }
    };

    // 飞镖修正数据
    const sendData = async () => {
      const min_test_num = 0;
      const max_test_num = 7400;
      const min_yaw_num = 0;
      const max_yaw_num = 7000;

      let currentTestNum = parseFloat(testNum.value) || 0; // 输入的新数据
      let currentYawNum = parseFloat(yawNum.value) || 0;

      // 检查 Test 电机输入值是否在范围内
      if (currentTestNum < min_test_num) {
        alert(`Distance 电机值不能小于 ${min_test_num}，已自动调整为 ${min_test_num}`);
        currentTestNum = min_test_num;
        testNum.value = min_test_num; // 更新输入框的值
      } else if (currentTestNum > max_test_num) {
        alert(`Distance 电机值不能大于 ${max_test_num}，已自动调整为 ${max_test_num}`);
        currentTestNum = max_test_num;
        testNum.value = max_test_num; // 更新输入框的值
      }

      // 检查 Yaw 电机输入值是否在范围内
      if (currentYawNum < min_yaw_num) {
        alert(`Yaw 电机值不能小于 ${min_yaw_num}，已自动调整为 ${min_yaw_num}`);
        currentYawNum = min_yaw_num;
        yawNum.value = min_yaw_num; // 更新输入框的值
      } else if (currentYawNum > max_yaw_num) {
        alert(`Yaw 电机值不能大于 ${max_yaw_num}，已自动调整为 ${max_yaw_num}`);
        currentYawNum = max_yaw_num;
        yawNum.value = max_yaw_num; // 更新输入框的值
      }


      const lastTestNum = parseFloat(testLastNum.value) || 0;
      const lastYawNum = parseFloat(yawLastNum.value) || 0;
      const data = {
        TOF: 0x5a,
        dart_state:1,
        test_num: currentTestNum,
        yaw_num: currentYawNum,
        test_last_num: lastTestNum, // 如果没有旧数据，则使用0
        yaw_last_num: lastYawNum,
      };

      try {
        // 发送差值到服务器
        await fetch("http://localhost:3000/stm32/sendStm32", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // 更新显示新数据
        testLastNum.value = currentTestNum.toFixed(2);
        yawLastNum.value = currentYawNum.toFixed(2);

        // 将 test_num 和 yaw_num 写入 temp.txt
        await fetch("http://localhost:3000/file/writeToTemp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            test_num: currentTestNum,
            yaw_num: currentYawNum,
          }),
        });

        console.log("Data successfully written to temp.txt");
      } catch (error) {
        console.error("Error sending data:", error);
      }
    };

    // 上膛
    const loaded = async () => {
      const data = {
        TOF: 0x5a,
        dart_state:2,
        test_num: 0x00,
        yaw_num: 0x00,
        test_last_num: 0x00,
        yaw_last_num: 0x00,
      };
      try {
        // 发送上膛数据
        await fetch("http://localhost:3000/stm32/sendStm32", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Error sending data:", error);
      }
    };

    // 发射
    const shoot = async () => {
      alert('已点击发射成功');
      const lastTestNum = parseFloat(testLastNum.value) || 0;
      const lastYawNum = parseFloat(yawLastNum.value) || 0;
      const yawNum = parseFloat(yaw.value) || 0;
      const pitchNum = parseFloat(pitch.value) || 0;
      const rollNum = parseFloat(roll.value) || 0;
      const addText = additionalText.value;
      const data_write = {
        test_num: lastTestNum,
        yaw_num: lastYawNum,
        // 保存陀螺仪数据与旧数据一起存入文件
        yaw_angle: yawNum,
        pitch_angle: pitchNum,
        roll_angle: rollNum,
        additionalText: addText, // 获取额外输入内容
      };
      const data = {
        TOF: 0x5a,
        dart_state:3,
        test_num: 0x01,
        yaw_num: 0x01,
        test_last_num: 0x01,
        yaw_last_num: 0x01,
      };

      try {
        await fetch("http://localhost:3000/stm32/sendStm32", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        //发送数据到文件保存
        await fetch("http://localhost:3000/file/writeStand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data_write),
        });
        additionalText.value = "";
      } catch (error) {
        console.error("Error sending data:", error);
      }
      router.push("/touch"); // 跳转到touch页面
    };

    // 一键四发
    const oneClickFourShoot = async () => {
      const data = {
        TOF: 0x5a,
        dart_state:4,
        test_num: 0x00,
        yaw_num: 0x00,
        test_last_num: 0x00,
        yaw_last_num: 0x00,
      };
      try {
        // 发送上膛数据
        await fetch("http://localhost:3000/stm32/sendStm32", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Error sending data:", error);
      }
    };

    // 镖架制导
    const dartStandGuide = async () => {
      alert('已点击镖架制导成功');
      const min_yaw_num = 0;
      const max_yaw_num = 7000;

      if (guideInterval) {
        console.warn('Guide is already running');
        return;
      }

      
      guideInterval = setInterval(async () => {
        await fetchLastLine();
        if (circles.value.length > 0) {
          const circle = circles.value[0]; // 获取第一个圆的数据
          const centerX = parseFloat(circle.center[0]); // 圆心中心 x 坐标
          const targetX = 0; // 摄像头安装误差
          deltaX.value = centerX - 768 - targetX; // 计算差值

          if (Math.abs(deltaX.value) < 15) {
            // 差值小于 5，停止循环
            stopGuide();
            console.log('Guide completed: DeltaX is less than 5');
            return;
          }

          const lastTestNum = parseFloat(testLastNum.value) || 0;
          const lastYawNum = parseFloat(yawLastNum.value) || 0;

          // 更新 yaw_num
          const currentTestNum = lastTestNum;
          if(deltaX.value > 0)
          {
            deltaX.value = 15;
          }
          else if(deltaX.value < 0)
          {
            deltaX.value = -15;
          }
          let currentYawNum = lastYawNum - deltaX.value;
          // 检查 Yaw 电机输入值是否在范围内
          if (currentYawNum < min_yaw_num) {
            currentYawNum = min_yaw_num;
          } else if (currentYawNum > max_yaw_num) {
            currentYawNum = max_yaw_num;
          }

          const data = {
            TOF: 0x5a,
            dart_state: 1,
            test_num: currentTestNum,
            yaw_num: currentYawNum,
            test_last_num: lastTestNum,
            yaw_last_num: lastYawNum,
          };

          try {
            // 发送差值到服务器
            await fetch("http://localhost:3000/stm32/sendStm32", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });

            // 更新显示新数据
            testLastNum.value = currentTestNum.toFixed(2);
            yawLastNum.value = currentYawNum.toFixed(2);

            // 将 test_num 和 yaw_num 写入 temp.txt
            await fetch("http://localhost:3000/file/writeToTemp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                test_num: currentTestNum,
                yaw_num: currentYawNum,
              }),
            });
          } catch (error) {
            console.error("Error sending data:", error);
          }
        } else {
          console.warn('No circles detected');
        }
      }, 200); // 每 100ms 检查一次
    };

    // 停止镖架制导
    const stopGuide = () => {
      alert('已结束镖架制导');
      if (guideInterval) {
        clearInterval(guideInterval);
        guideInterval = null;
        console.log('Guide stopped');
      }
    };

    // 监听 dart_game_state 变化
    watch(dart_game_state, (newValue) => {
      const state = parseFloat(newValue);
      if (state > 1) {
        console.log("检测到飞镖上场状态，自动启动镖架制导");
        dartStandGuide(); // 启动镖架制导
      }
    });


    // 在 mounted 时只获取一次最后一行数据
    onMounted(async () => {
      await fetchLastLine(); // 获取最后一行数据
      setInterval(fetchData, 100); // 每100ms获取实时数据

      // 连接到 WebSocket 服务器
      socket = io('http://localhost:3000');

      // 监听连接成功事件
      socket.on('connect', () => {
        //console.log('Connected to WebSocket server');
      });

      // 监听后端发送的图像和圆的数据
      socket.on('image', (data) => {
        //console.log('Received image and circles data:', data);

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
          //console.log('Image src updated:', videoStream.value.src);
        }

        // 更新圆的信息
        circles.value = data.circles;
      });

      // 监听断开连接事件
      socket.on('disconnect', () => {
        //console.log('Disconnected from WebSocket server');
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
      testNum,
      yawNum,
      deltaX,
      dart_state,
      testLastNum,
      yawLastNum,
      sendData,
      loaded,
      shoot,
      oneClickFourShoot,
      dartStandGuide,
      ackValue,
      yaw,
      pitch,
      roll,
      acc,
      distance_m,
      additionalText,
      videoStream,
      circles,
      stopGuide,
    };
  },
};
</script>



<template>
  <div class = "stand">
    <div class = "stand_control">
      <div class="IMU_container">
        <!-- 显示数据的表格 -->
        <table>
          <thead>
          <tr>
            <th>属性</th>
            <th>值（度数/m）</th>
          </tr>
          </thead>
          <tbody>
          <tr><td>Yaw</td><td>{{ yaw }}</td></tr>
          <tr><td>Pitch</td><td>{{ pitch }}</td></tr>
          <tr><td>Roll</td><td>{{ roll }}</td></tr>
          <tr><td>Acc X</td><td>{{ acc.x }}</td></tr>
          <tr><td>Acc Y</td><td>{{ acc.y }}</td></tr>
          <tr><td>Acc Z</td><td>{{ acc.z }}</td></tr>
          <tr><td>测距</td><td>{{ distance_m }}</td></tr>
          </tbody>
        </table>
        <div>
          <!-- 输入框用于输入额外内容 -->
          <textarea v-model="additionalText" placeholder="请输入备注"></textarea>
        </div>
      </div>

      <div class="stand_container">
        <div class="stand_top">
          <h3>下一次镖架数据</h3>
          <input type="number" v-model="testNum" placeholder="Distance 电机" step="any" />
          <input type="number" v-model="yawNum" placeholder="Yaw 电机" step="any" />

          <button @click="sendData">发送数据</button>
          <button @click="loaded">飞镖上膛</button>
          <button @click="shoot">飞镖发射</button>
          <button @click="oneClickFourShoot">一键四发</button>
          <button @click="dartStandGuide">镖架制导</button>
          <button @click="stopGuide">停止镖架制导</button>
          <h3>目前镖架数据</h3>
          <div class="value-display">Distance 电机: <span>{{ testLastNum }}</span></div>
          <div class="value-display">Yaw 电机: <span>{{ yawLastNum }}</span></div>
        </div>
      </div>
    </div>
    <div class = "stand_vision">
      <h3>引导灯圆心：</h3>
      <ul>
        <li v-for="(circle, index) in circles" :key="index">
          中心： ({{ circle.center[0] }}, {{ circle.center[1] }}), 半径：{{ circle.radius }}
        </li>
      </ul>
      <div class="image-container">
        <img ref="videoStream" width="640" height="480" alt="Camera Stream" />
        <div class="crosshair"></div> <!-- 十字线 -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.stand{
  display: flex;
  flex-direction: column;
  flex: 1;
}
.stand_control{
  display: flex;
  flex-direction: row;
  flex: 1;
}
.stand_vision{
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stand_container {
  display: flex;
  flex-direction: column;
  flex: 1; /* 左右各占一半宽度 */
}
.IMU_container {
  flex: 1; /* 左右各占一半宽度 */
  align-items: center;
  justify-content: center;
}
.stand_top {
  margin-top: 10px;
  margin-left: 10%;
  flex: 2; /* 上半部分占 1 份高度 */
}
.stand_bottom {
  margin-left: 10%;
  margin-top: 6px;
  flex: 1; /* 下半部分占 1 份高度 */
  align-items: center;
}
input[type="number"] {
  width: 90%;
  padding: 6px;
  margin-top: 6px;
}
button {
  width: 90%;
  padding: 6px;
  background-color: #b9e8a6;
  margin-top: 6px;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #b9e8a6;
}
textarea {
  width: 90%;
  height: 90%;
  padding: 10px;
  margin: 5%;
}
.value-display {
  margin-top: 15px;
  margin-left: 20px;
  font-size: 16px;
}
table {
  border-collapse: collapse;
  width: 90%;
  margin-top: 20px;
  margin-left: 5%;
  text-align: left; /* 设置表格文本左对齐 */
  background-color: #ebf5e6;
}
th, td {
  border: 1px solid #ccc;
  padding: 5px;
  text-align: center;
  width: 50%;
}
th {
  background-color:#b9e8a6;
}

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
