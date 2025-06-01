<template>
  <div>
    <h3>选择并播放视频</h3>

    <select v-model="selectedFile" @change="playVideo">
      <option disabled value="">请选择 MP4 文件</option>
      <option v-for="file in fileList" :key="file" :value="file">
        {{ file }}
      </option>
    </select>

    <div v-if="videoUrl">
      <h3>视频播放</h3>
      <video ref="videoPlayer" controls>
        <source :src="videoUrl" type="video/mp4" />
        您的浏览器不支持视频播放。
      </video>
    </div>

    <p v-if="status">{{ status }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      fileList: [],
      selectedFile: "",
      videoUrl: "",
      status: "",
    };
  },
  methods: {
    async fetchFileList() {
      try {
        const response = await axios.get("http://localhost:3000/video/mp4-list");
        if (response.data.success) {
          this.fileList = response.data.files;
        } else {
          this.status = "无法获取文件列表";
        }
      } catch (error) {
        this.status = "请求文件列表失败";
        console.error(error);
      }
    },
    playVideo() {
      if (!this.selectedFile) return;
      this.videoUrl = `http://localhost:3000/videos/${this.selectedFile}`; // ✅ 直接访问 `/videos/xxx.mp4`
      this.status = "正在播放 " + this.selectedFile;

      // 重新加载视频
      this.$nextTick(() => {
        this.$refs.videoPlayer.load();
      });
    }
  },
  mounted() {
    this.fetchFileList();
  }
};
</script>

<style scoped>
h3{
  margin-top: 6px;
  margin-left: 10%;
}

select {
  margin-top: 10px;
  margin-left: 10%;
  width: 80%;
  height: 30px;
  color: #2d4428;
  background-color:#d5f1c9;
}
</style>