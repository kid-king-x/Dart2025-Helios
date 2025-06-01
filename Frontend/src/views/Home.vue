<script>
import Stand_control from '../components/Stand_control.vue';
import Print_data from '../components/Print_data.vue';
import displayTouch from '../components/touch/displayTouch.vue';
import Maixcam from '../components/Maixcam.vue';
import Stand_camera from '@/components/stand_guide/Stand_camera.vue';
import Aircraft from "../components/Aircraft.vue"; // 确保路径正确
import FileOperations from '@/components/FileOperations.vue';
import VideoUploader from '@/components/body_guide/VideoUploader.vue';

export default {
  components: {
    displayTouch,
    Stand_control,
    Print_data,
    Maixcam,
    Stand_camera,
    Aircraft,
    FileOperations,
    VideoUploader,
  },
};
</script>

<template>

  <div class="container">
    <!-- 左侧 -->
    <div class="left">
      <div class="stand_control">
        <Stand_control/>
      </div>
      <!-- <div class="stand_camera">
        <Stand_camera/>
      </div> -->
    </div>
    <!-- 右侧 -->
    <div class="right">
      <div class="data_display">
        <div class="location">
          <displayTouch :width="660" :height="374"/>
        </div>
        <div class="file_data">
          <Print_data/>
        </div>
      </div>
      <div class="dart_body">
        <div class="body_camera">
          <div class="body_camera_file">
            <FileOperations />
          </div>
          <div class="body_camera_mp4">
            <VideoUploader />
          </div>
        </div>
        <div class="body_data">
          <Aircraft />
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>

/* 标题样式 */
.header {
  top: 0; /* 距离顶部 0 */
  left: 0; /* 左侧对齐 */
  width: 100%; /* 占满宽度 */
  height: 40px; /* 设置合适的高度 */
  z-index: 10; /* 提高层级，避免被其他元素遮挡 */
  display: flex;
  align-items: center;
  justify-content: center; /* 水平居中 */
  border: 2px solid #97c977;
}
.container {
  width: 100%;
  height: 950px;
  border: 2px solid #97c977;
  display: flex;
  border-radius: 10px;
  //background-color: #fff;
  overflow: hidden;
}
.left {
  flex: 1.05;
  display: flex;
  width: 30%;
  flex-direction: column;
  border-right: 1px solid #97c977;
}
.right {
  flex: 2;
  display: flex;
  flex-direction: column;
  position: relative;
  //border-right: 2px solid #ddd;
}
.stand_control {
  flex: 1; /* 上半部分占 1 份高度 */
  display: flex; /* 再次使用 flex 布局 */
  border-bottom: 1px solid #97c977;
  flex-direction: row;
}
.stand_camera {
  flex: 1.29; /* 下半部分占 1.7 份高度 */
  display: flex; /* 再次使用 flex 布局 */
  //border-bottom: 2px solid #ccc;
  flex-direction: row;
}
.dart_body {
  flex: 1.29; /* 上半部分占 1 份高度 */
  display: flex; /* 再次使用 flex 布局 */
  //border-bottom: 2px solid #ccc;
  flex-direction: row;
}
.data_display {
  flex: 1;
  display: flex; /* 再次使用 flex 布局 */
  border-bottom: 1px solid #97c977;
  flex-direction: row;
}
.body_data {
  flex: 1;
  align-items: center;
  justify-content: center;
  //border-right: 2px solid #ccc;
}
.body_camera {
  flex: 2;
  //align-items: center;
  //justify-content: center;
  border-right: 1px solid #97c977;
  display: flex;
  flex-direction: row;
}
.body_camera_file {
  flex: 1;
  //align-items: center;
  //justify-content: center;
  border-right: 1px solid #97c977;
}
.body_camera_mp4 {
  flex: 1;
  //align-items: center;
  //justify-content: center;
  //border-right: 1px solid #97c977;
}

.file_data {
  flex: 1;
  align-items: center;
  justify-content: center;
  //border-right: 2px solid #ccc;
}
.location {
  flex: 1.15;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #97c977;
}
</style>




<!--&lt;!&ndash; App.vue &ndash;&gt;-->

<!--</template>-->

<!--<script>-->
<!--// 引入 FileOperations 组件-->
<!--import FileOperations from '@/components/FileOperations.vue';-->

<!--export default {-->
<!--  name: 'App',-->
<!--  components: {-->
<!--    FileOperations,  // 注册子组件-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style>-->
<!--/* 样式可以根据需要添加 */-->
<!--</style>-->

