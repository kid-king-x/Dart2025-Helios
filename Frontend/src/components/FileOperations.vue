<template>
  <div>
    <!-- 选择设备 IP -->
    <div class="IP">
      <h3>选择设备要读取的IP设备:</h3>
      <div>
        <button
            class="ip_button"
            v-for="(ip, index) in deviceIps"
            :key="index"
            @click="changeDeviceIp(ip)"
            :style="deviceIp === ip ? { backgroundColor: '#a7e39a' } : {}"
        >
          {{ ip }}
        </button>
      </div>
      <h3 v-if="!deviceIp">你还没选择设备 IP</h3>
    </div>

    <!-- 文件列表 -->
    <div class="file" v-if="showDownloadList">
      <h3>可下载文件列表:</h3>
      <ul>
        <li v-for="(file, index) in files" :key="index">
          {{ file }}
          <button
              class="select_button"
              @click="downloadAndRename(file)"
              :style="downloadedFile === file ? { backgroundColor: '#a7e39a' } : {}"
          >
            选择
          </button>
        </li>
      </ul>
    </div>

    <!-- 下载完成后重命名文件 -->
    <div v-if="downloadedFile">
      <h4>重命名文件: {{ downloadedFile }}</h4>
      <input v-model="newFileName" placeholder="新文件名" />
      <button
          class="select_button"
          @click="renameLocalFile"
          :style="renamedFile === newFileName ? { backgroundColor: '#a7e39a' } : {}"
      >
        确认重命名
      </button>
    </div>

    <h4 v-if="status">{{ status }}</h4>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      deviceIps: [
        "10.65.15.1", "10.41.199.1", "10.120.238.1", "192.168.1.4",
        "192.168.1.5", "192.168.1.6", "192.168.1.7", "192.168.1.8",
        "192.168.1.9", "192.168.1.10"
      ],
      files: [],
      deviceIp: "",
      showDownloadList: false,
      downloadedFile: "",
      newFileName: "",
      renamedFile: "", // 存储重命名的文件名
      status: "",
    };
  },
  methods: {
    async changeDeviceIp(ip) {
      this.deviceIp = ip;
      this.showDownloadList = true;
      await this.getFileList();
    },
    async getFileList() {
      if (!this.deviceIp) {
        this.status = "请先选择设备 IP";
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/sftp/files", {
          params: { ip: this.deviceIp },
        });

        if (response.data.success) {
          this.files = response.data.files;
          this.status = "文件列表加载成功";
        } else {
          this.status = "获取文件列表失败";
        }
      } catch (error) {
        this.status = "发生错误";
        console.error(error);
      }
    },
    async downloadAndRename(file) {
      try {
        const response = await axios.get("http://localhost:3000/sftp/download", {
          params: { fileName: file, ip: this.deviceIp },
          responseType: "blob",
        });

        const blob = new Blob([response.data]);
        this.downloadedFile = file;
        this.newFileName = ""; // 清空输入框

        // 生成 URL 并下载文件
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.status = "文件下载成功，请输入新文件名";
      } catch (error) {
        this.status = "下载失败";
        console.error(error);
      }
    },
    renameLocalFile() {
      if (!this.newFileName.trim()) {
        this.status = "请输入新文件名";
        return;
      }

      // 模拟重命名操作
      this.renamedFile = this.newFileName;
      this.status = `文件 ${this.downloadedFile} 已重命名为 ${this.renamedFile}`;
      this.downloadedFile = this.renamedFile; // 让下载的文件变成新文件名
    }
  }
};
</script>

<style scoped>
h3, h4 {
  margin-top: 6px;
  margin-left: 10%;
}
.ip_button, .select_button {
  margin-left: 10%;
  width: 35%;
  margin-top: 5px;
  color: #6b9363;
  background-color: #d9f3d0;
  border: none;
  padding: 6px;
}
</style>
