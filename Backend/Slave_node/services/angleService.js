const fs = require("fs");
const path = require("path");

// 获取文件列表
const getAnglesFromFileList = async () => {
  const anglesDirectory = path.join(__dirname, "../downloads"); // 确保路径正确
  try {
    // 异步读取文件夹中的所有文件
    const angleFiles = await fs.promises.readdir(anglesDirectory);
    // 过滤出所有以 .txt 结尾的文件
    return angleFiles.filter(file => file.endsWith(".txt"));
  } catch (error) {
    console.error("无法读取文件列表:", error);
    throw new Error("无法读取文件列表");
  }
};

const getAnglesFromFile = async (fileName) => {
    const anglesDirectory = path.join(__dirname, "../downloads");
    const filePath = path.join(anglesDirectory, fileName);
  
    console.log("文件路径:", filePath); // 打印文件路径进行调试
  
    try {
      // 异步读取文件内容
      const data = await fs.promises.readFile(filePath, "utf8");
      const lines = data.split("\n");
  
      // 解析每行数据
      const angleData = lines.map(line => {
        // 去掉每行前面的 "角度：" 字符串
        const cleanedLine = line.replace("角度：", "").trim();
  
        // 使用正则拆分数字
        const [pitch, roll, yaw] = cleanedLine.split(/\s+/);
        return {
          pitch: parseFloat(pitch),
          roll: parseFloat(roll),
          yaw: parseFloat(yaw)
        };
      });
  
      return angleData;
    } catch (error) {
      console.error(`无法读取文件 ${fileName} 时出错:`, error);
      throw new Error("无法读取文件数据");
    }
  };

module.exports = { getAnglesFromFileList, getAnglesFromFile };
