<template>
  <div class="Print_data">
    <!-- flex 布局展示文件内容 -->
    <div class="flex-container">
      <div v-for="(line, index) in fileContent" :key="index" class="flex-item">
        <p>{{ line.content }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  name: "Print_data",
  setup() {
    const fileContent = ref([]);

    // 加载文件内容
    const loadFile = async () => {
      try {
        const response = await fetch("http://localhost:3000/file/displayFile");
        const data = await response.json();
        fileContent.value = data.lines; // 解析并存储文件内容
      } catch (error) {
        console.error("Error loading file:", error);
      }
    };

    // 组件加载时自动获取文件内容
    onMounted(loadFile);

    return {
      fileContent,
    };
  },
};
</script>

<style scoped>
.Print_data {
  margin-left: 5%;
  margin-top: 1%;
}

.flex-container {
  display: flex;
  gap: 10px;
  flex-direction: column;
  margin-top: 6px;
}

.flex-item {
  background-color: #c1eeaf;
  padding: 8px;
  border-radius: 8px;
  width: 93%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.flex-item p {
  margin: 5px 0;
  font-size: 14px;
}
</style>
