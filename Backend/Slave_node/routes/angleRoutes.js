const express = require("express");
const { getAnglesFromFileList, getAnglesFromFile } = require("../services/angleService");

const router = express.Router();

// 获取所有文件列表
router.get("/files", async (req, res) => {
  try {
    const files = await getAnglesFromFileList(); // 获取文件列表
    console.log("文件列表:", files);  // 打印文件列表，方便调试
    res.json(files); // 返回所有文件名
  } catch (error) {
    console.error("无法读取文件列表:", error);
    res.status(500).json({ error: "无法读取文件列表" });
  }
});
// 根据文件名获取角度数据
router.get("/:fileName", async (req, res) => {
    try {
      console.log("请求的文件名:", req.params.fileName);  // 打印文件名进行调试
      const angles = await getAnglesFromFile(req.params.fileName); // 获取指定文件的角度数据
      res.json(angles); // 返回角度数据
    } catch (error) {
      console.error(`无法读取文件 ${req.params.fileName} 的数据:`, error);
      res.status(500).json({ error: "无法读取文件数据" });
    }
  });
  

module.exports = router;
