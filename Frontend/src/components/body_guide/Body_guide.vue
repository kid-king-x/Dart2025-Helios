<template>
  <div v-if="videoUrl">
    <h3>视频播放</h3>
    <video ref="videoPlayer" controls>
      <source :src="videoUrl" type="video/mp4" />
      您的浏览器不支持视频播放。
    </video>
  </div>
</template>

<script>
export default {
  data() {
    return {
      videoUrl: "",
    };
  },
  methods: {
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

</style>
  