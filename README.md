# AI网站生成器

基于AI的智能网站生成器，只需输入文本报告，即可生成完整的网站。支持多种AI模型，提供实时聊天优化和代码编辑功能。

## 主要功能

- **多AI模型支持**: 支持Gemini、Claude、GPT等多种AI模型
- **智能聊天**: 与AI实时对话，优化网站生成效果
- **代码编辑器**: 内置代码编辑器，支持实时预览和编辑
- **智能规划**: AI自动分析报告内容，生成网站结构规划
- **一键部署**: 自动化部署脚本，3步完成部署
- **响应式设计**: 生成的网站自适应各种设备
- **实时预览**: 即时查看生成效果，支持实时修改

## 快速开始指南

### Docker部署 (推荐)

#### 1. 获取API密钥
- **Gemini API**: 访问 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取 Gemini API密钥
- **OpenRouter API** (可选): 访问 [OpenRouter](https://openrouter.ai/) 获取API密钥以使用更多AI模型

#### 2. 运行自动部署脚本
```bash
./scripts/deploy.sh
```
脚本会自动：
- 检查Docker环境
- 帮你创建.env文件
- 构建和启动容器
- 检查应用健康状态

#### 3. 开始使用
打开浏览器访问：**http://localhost:8080**

### 本地开发

**前置要求**: Node.js 18+

1. 安装依赖:
   ```bash
   npm install
   ```
2. 在 `.env.local` 文件中设置API密钥:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key  # 可选
   ```
3. 运行应用:
   ```bash
   npm run dev
   ```

## 功能特性

部署成功后，你可以：

### 智能报告分析
1. **输入文本报告**: 支持各种格式的文本报告
2. **AI智能分析**: 自动提取关键信息和结构
3. **生成网站规划**: AI制定详细的网站结构和内容规划

### 多AI模型支持
- **Gemini**: Gemini 2.5 Pro
- **Claude**: Claude 4 Sonnet
- **其他模型**: 通过 OpenRouter 支持更多AI模型

### 智能聊天优化
- **实时对话**: 与AI实时交流，优化生成效果
- **上下文理解**: AI记住之前的对话内容
- **个性化建议**: 根据你的需求提供定制化建议

### 网站生成
- **响应式设计**: 自动适配桌面和移动设备
- **现代UI**: 使用最新的设计趋势和最佳实践
- **SEO优化**: 生成的网站包含SEO最佳实践
- **可定制**: 支持进一步的个性化定制

## 文件结构

```
ai-website-generator-from-report/
├── src/                    # 源代码目录
│   ├── components/         # React组件
│   │   ├── ChatPanel.tsx           # 聊天面板组件
│   │   ├── CodeEditor.tsx          # 代码编辑器组件
│   │   ├── ModelSelector.tsx       # AI模型选择器
│   │   ├── OutputDisplay.tsx       # 输出显示组件
│   │   ├── PlanDisplay.tsx         # 规划显示组件
│   │   ├── ReportInputForm.tsx     # 报告输入表单
│   │   └── LoadingSpinner.tsx      # 加载动画组件
│   ├── services/          # 服务层代码
│   │   ├── aiService.ts            # AI服务统一接口
│   │   ├── geminiService.ts        # Gemini API服务
│   │   ├── openrouterService.ts    # OpenRouter API服务
│   │   └── openrouterChatService.ts # OpenRouter聊天服务
│   ├── types/             # 类型定义
│   ├── templates/         # 模板文件
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 应用入口
├── docker/                # Docker相关文件
│   ├── Dockerfile         # Docker镜像构建文件
│   ├── docker-compose.yml # Docker Compose配置
│   ├── nginx.conf         # Nginx配置文件
│   └── .dockerignore      # Docker忽略文件
├── scripts/               # 脚本文件
│   └── deploy.sh          # 自动部署脚本
├── index.html             # HTML入口文件
├── package.json           # 项目依赖
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite配置
├── .gitignore             # Git忽略文件
├── metadata.json          # 项目元数据
└── README.md              # 项目说明文档
```

## 技术栈

### 前端技术
- **React 19**: React框架
- **TypeScript**: 类型安全的JavaScript
- **Vite**: 快速的构建工具

### AI集成
- **Google Gemini API**
- **OpenRouter API**

### 部署技术
- **Docker**
- **Nginx**
- **Docker Compose**

## 安全注意事项

1. **API密钥安全**: 
   - 永远不要将API密钥提交到版本控制系统
   - 使用环境变量存储敏感信息
   - 定期轮换API密钥

2. **容器安全**: 
   - 定期更新基础镜像以获取安全补丁
   - 使用非root用户运行容器
   - 限制容器权限

3. **网络安全**: 
   - 在生产环境中使用HTTPS
   - 配置适当的防火墙规则
   - 使用网络隔离

4. **数据安全**: 
   - 确保敏感信息不会记录在日志中
   - 实施适当的数据备份策略
   - 遵循数据保护法规

## 更新日志

### v1.2.0 (最新)
- 新增多AI模型支持 (Claude, GPT等)
- 添加智能聊天功能
- 集成专业代码编辑器
- 优化用户界面和体验
- 改进部署脚本和文档

### v1.1.0
- 添加Docker支持
- 完善部署文档
- 优化构建流程

### v1.0.0
- 初始版本发布
- 基础AI网站生成功能
- 报告分析和规划生成

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。