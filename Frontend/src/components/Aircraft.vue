<template>
  <!-- 文件选择 -->
  <div>
    <select v-model="selectedFile" @change="loadAngles">
      <option value="" disabled selected>请选择需要查看的陀螺仪数据</option>
      <option v-for="file in fileList" :key="file" :value="file">{{ file }}</option>
    </select>
  </div>
  <!-- 显示输入 -->
  <table>
    <tbody>
    <tr>
      <td>Pitch:</td><td>{{ pitch }}</td>
      <td>Roll:</td><td>{{ roll }}</td>
      <td>Yaw:</td><td>{{ yaw }}</td>
    </tr>
    </tbody>
  </table>
  <!-- 飞镖模型 -->
  <div ref="container" class="scene-container"></div>
</template>

<script>
import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { shallowRef, ref, onMounted, onBeforeUnmount, watch } from "vue";

export default {
  name: "Aircraft",
  props: {
    pitch: { type: Number, default: 0 },
    roll: { type: Number, default: 0 },
    yaw: { type: Number, default: 0 },
  },
  setup(props) {
    const container = shallowRef(null);
    const scene = shallowRef(new THREE.Scene());
    const camera = shallowRef(null);
    const renderer = shallowRef(null);
    const aircraft = shallowRef(null);
    const skybox = shallowRef(null);

    const pitch = ref(props.pitch);
    const roll = ref(props.roll);
    const yaw = ref(props.yaw);
    
    // **文件列表和选择的文件**
    const fileList = ref([]);
    const selectedFile = ref("");

    // **姿态数据**
    const frames = ref([]);
    const currentFrame = ref(0);

    // **初始化 Three.js 场景**
    const initScene = () => {
      if (!container.value) return;

      camera.value = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 100);
      camera.value.position.set(0, 2, 4);
      camera.value.lookAt(0, 0, 0);

      renderer.value = new THREE.WebGLRenderer({ antialias: true });
      renderer.value.setSize(container.value.clientWidth, container.value.clientHeight);
      container.value.appendChild(renderer.value.domElement);

      createSkybox();
      createAircraft();

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(5, 5, 5);
      scene.value.add(light);

      window.addEventListener("resize", onWindowResize);
      animate();
    };

    // **创建 Skybox**
    const createSkybox = () => {
      skybox.value = new Sky();
      skybox.value.scale.setScalar(50);
      scene.value.add(skybox.value);

      const skyUniforms = skybox.value.material.uniforms;
      skyUniforms["turbidity"].value = 5;
      skyUniforms["rayleigh"].value = 4;
      skyUniforms["mieCoefficient"].value = 0.005;
      skyUniforms["mieDirectionalG"].value = 0.8;

      const sun = new THREE.Vector3();
      sun.setFromSphericalCoords(1, Math.PI / 3, Math.PI);
      skyUniforms["sunPosition"].value.copy(sun);

      scene.value.background = new THREE.Color(0x87CEEB);
    };

    // **创建飞行器**
    const createAircraft = () => {
      const material = new THREE.MeshStandardMaterial({ color: 0xb9e8a6 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 1), material);

      const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xb9e8a6 });
      const wing1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 10), wingMaterial);
      wing1.rotation.z = Math.PI / 2;
      wing1.position.set(0, 0.2, 0.8);

      const wing2 = wing1.clone();
      wing2.position.set(0, 0.2, -0.8);

      aircraft.value = new THREE.Group();
      aircraft.value.add(body);
      aircraft.value.add(wing1);
      aircraft.value.add(wing2);
      scene.value.add(aircraft.value);
    };

    // **更新飞行器姿态**
    const updateAttitude = () => {
      if (aircraft.value) {
        aircraft.value.rotation.x = THREE.MathUtils.degToRad(pitch.value);
        aircraft.value.rotation.y = THREE.MathUtils.degToRad(yaw.value);
        aircraft.value.rotation.z = THREE.MathUtils.degToRad(roll.value);
      }
    };

    // **监听姿态角变化**
    watch([pitch, roll, yaw], updateAttitude);

    // **动画循环**
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.value.render(scene.value, camera.value);
    };

    // **窗口大小调整**
    const onWindowResize = () => {
      if (!camera.value || !renderer.value || !container.value) return;
      camera.value.aspect = container.value.clientWidth / container.value.clientHeight;
      camera.value.updateProjectionMatrix();
      renderer.value.setSize(container.value.clientWidth, container.value.clientHeight);
    };

    // **从后端获取文件列表**
    const fetchFileList = async () => {
      try {
        const response = await fetch("http://localhost:3000/angle/files"); // 后端列出所有文件
        const data = await response.json();
        fileList.value = data; // 文件列表
      } catch (error) {
        console.error("获取文件列表失败:", error);
      }
    };

    // **加载选中的文件的数据**
    const loadAngles = async () => {
      if (!selectedFile.value) return;

      try {
        const response = await fetch(`http://localhost:3000/angle/${selectedFile.value}`); // 请求选中文件的数据
        const data = await response.json();

        frames.value = data;
        currentFrame.value = 0;
        updateAttitudeFromFile(); // 初始化数据
      } catch (error) {
        console.error("加载角度数据失败:", error);
      }
    };

    // **定时逐帧更新**
    const updateAttitudeFromFile = () => {
      setInterval(() => {
        if (frames.value.length > 0) {
          const frame = frames.value[currentFrame.value];
          pitch.value = frame.pitch;
          roll.value = frame.roll;
          yaw.value = frame.yaw;
          updateAttitude();

          // 更新帧计数器
          currentFrame.value = (currentFrame.value + 1) % frames.value.length;
        }
      }, 100); // 每100毫秒更新一次
    };

    onMounted(() => {
      initScene();
      fetchFileList(); // 初始化文件列表
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", onWindowResize);
    });

    return { container, pitch, roll, yaw, fileList, selectedFile, loadAngles };
  },
};
</script>

<style scoped>
.scene-container {
  width: 300px;
  height: 300px;
}

select {
  margin-top: 10px;
  margin-left: 5%;
  width: 90%;
  height: 30px;
  color: #2d4428;
  background-color:#d5f1c9;

}

select:hover {
  background-color: #b9e8a6;
}

select option {
  color: #4a6c42;
  background-color: #d5f1c9;
}
table {
  flex: 1;
  border: 1px solid #4a6c42;
  border-collapse: collapse;
  width: 90%;
  margin-left: 5%;
  margin-top: 10px;
  text-align: left; /* 设置表格文本左对齐 */
  background-color: #ebf5e6;
}
tr, td {
  border: 1px solid #ccc;
  padding: 3px;
  text-align: center;
  width: 15%;
}
th {
  background-color:#b9e8a6;
}
</style>
