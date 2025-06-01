<script>
import Hls from 'hls.js';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Maixcam",
  mounted() {
    const video = document.getElementById('video');
    const hlsUrl = 'http://localhost/stream/index.m3u8'; // HLS 流的 URL

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 2, // 保持与最新流片段的同步
        enableWorker: true,
        debug: false,
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS 流加载完成，开始播放...");
        video.play();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS 播放错误: ", data);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
    } else {
      console.error("该浏览器不支持 HLS 流播放，请使用支持 HLS 的播放器或浏览器。");
      this.$refs.videoContainer.innerHTML = "<h2>您的浏览器不支持 HLS 播放，请更换浏览器！</h2>";
    }
  }
};
</script>

<template>
  <div ref="videoContainer">
    <video id="video" controls autoplay style="width: 85%; max-width: 800px;"></video>
  </div>
</template>

<style scoped>
/* 这里可以添加自定义样式 */
</style>

<!--ffmpeg -i rtsp://192.168.124.145:8554/live -c:v libx264 -c:a aac -strict experimental -f hls -hls_time 2 -hls_list_size 5 -hls_flags delete_segments D:/git/Dart-kid/Software/Dart_parameter/Parameter-http-pages/stream/index.m3u8-->