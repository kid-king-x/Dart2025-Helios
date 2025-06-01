# 对整个Slave_node工程的说明

整个工程基于MVC架构，分为routes层、services层和config.js配置文件

整个项目结构如下：

```
project/
├── config/
│   └── config.js          # 配置文件
├── routes/
│   └── fileRoutes.js      # 路由层
├── services/
│   └── fileService.js     # 服务层
├── utils/
│   └── fileUtils.js       # 工具函数
├── app.js                 # 主应用文件
└── package.json
```

### 配置文件config.js

`config.js` 用于存储文件路径等配置信息。

### 工具函数fileUtils.js

`fileUtils.js` 包含读取文件的通用函数。

### 服务层

负责业务逻辑

### 路由层

负责处理 HTTP 请求，调用服务层获取数据并返回响应。

### 主应用文件

是应用的入口文件，负责加载路由和启动服务器。