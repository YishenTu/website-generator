# AI网站生成器

基于AI的智能网站生成器，只需输入文本报告，即可生成完整的网站。支持多种AI模型，提供实时聊天优化和代码编辑功能。

## 主要功能

- **多AI模型支持**: 支持Gemini、Claude、GPT等多种AI模型
- **智能聊天**: 与AI实时对话，优化网站生成效果
- **代码编辑器**: 内置代码编辑器，支持实时预览和编辑
- **智能规划**: AI自动分析报告内容，生成网站结构规划
- **现代化布局**: 采用Linear App风格的现代化布局设计，辅以灵活的网格布局
- **一键部署**: 自动化部署脚本，3步完成部署
- **响应式设计**: 生成的网站自适应各种设备
- **实时预览**: 即时查看生成效果，支持实时修改

## 快速开始指南

### Docker部署 (推荐)

#### 1. 获取API密钥
- **Gemini API**: 访问 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取 Gemini API密钥
- **OpenRouter API** (可选): 访问 [OpenRouter](https://openrouter.ai/) 获取API密钥以使用更多AI模型
- **OpenAI API** (可选): 访问 [OpenAI](https://platform.openai.com/) 获取API密钥

#### 2. 运行自动部署脚本
```bash
./scripts/deploy.sh
```
脚本会自动：
- 检查Docker环境
- 帮你创建.env文件
- 构建和启动容器
- 检查应用健康状态
- 解决常见的构建问题（如esbuild版本冲突）

#### 3. 开始使用
打开浏览器访问：**http://localhost:8080**

### 本地调试

**前置要求**: Node.js 18+

1. 安装依赖:
   ```bash
   npm install
   ```
2. 在 `.env.local` 文件中设置API密钥:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key  # 可选
   OPENAI_API_KEY=your_openai_api_key  # 可选
   ```
3. 运行应用:
   ```bash
   npm run dev
   ```

## 功能特性

### 智能报告分析
1. **输入文本报告**: 支持各种格式的文本报告
2. **AI智能分析**: 自动提取关键信息和结构
3. **生成网站规划**: AI制定详细的网站结构和内容规划，采用现代化的Linear App布局风格

### 多AI模型支持
- **Gemini**: Gemini 2.5 Pro
- **Claude**: Claude 4 Sonnet
- **ChatGPT**: GPT-4.1
- **其他模型**: 通过 OpenRouter 或 OpenAI 支持更多AI模型

### 智能聊天优化
- **实时对话**: 与AI实时交流，优化生成效果
- **上下文理解**: AI记住之前的对话内容
- **个性化建议**: 根据你的需求提供定制化建议

### 网站生成
- **现代化布局**: 采用Linear App风格的垂直流动布局，在适当时使用网格布局展示数据
- **响应式设计**: 自动适配桌面和移动设备
- **现代UI**: 使用最新的设计趋势和最佳实践
- **SEO优化**: 生成的网站包含SEO最佳实践
- **可定制**: 支持进一步的个性化定制

## 文件结构

```
ai-website-generator-from-report/
├── src/                    # 源代码目录
│   ├── components/         # React组件和工具函数
│   │   ├── icons/                  # 图标组件目录
│   │   │   └── index.tsx           # 统一的图标导出文件
│   │   ├── AppStages.tsx           # 应用阶段管理组件
│   │   ├── ChatPanel.tsx           # 聊天面板组件
│   │   ├── CodeEditor.tsx          # 代码编辑器组件
│   │   ├── ErrorBoundary.tsx       # 错误边界组件
│   │   ├── LoadingSpinner.tsx      # 加载动画组件
│   │   ├── ModelSelector.tsx       # AI模型选择器
│   │   ├── OutputDisplay.tsx       # 输出显示组件
│   │   ├── PlanDisplay.tsx         # 规划显示组件
│   │   ├── PreviewLoader.tsx       # 预览加载器组件
│   │   ├── ReportInputForm.tsx     # 报告输入表单
│   │   ├── TabButton.tsx           # 标签按钮组件
│   │   ├── appStateUtils.ts        # 应用状态工具函数
│   │   ├── fileUtils.ts            # 文件操作工具函数
│   │   └── textUtils.ts            # 文本处理工具函数
│   ├── hooks/             # 自定义React Hooks
│   │   ├── useDebounce.ts          # 防抖动Hook
│   │   ├── useBufferedUpdater.ts   # 缓冲更新Hook
│   │   └── useWebsiteGeneration.ts # 网站生成业务逻辑Hook
│   ├── services/          # 服务层代码
│   │   ├── aiService.ts            # AI服务统一接口
│   │   ├── geminiService.ts        # Gemini API服务
│   │   ├── openaiService.ts        # OpenAI API服务
│   │   ├── openrouterService.ts    # OpenRouter API服务
│   │   └── streamRequest.ts        # 流请求处理服务
│   ├── templates/         # 模板文件
│   │   └── promptTemplates.ts      # AI提示词模板
│   ├── types/             # 类型定义
│   │   └── types.ts                # TypeScript类型定义
│   ├── utils/             # 工具函数
│   │   ├── constants.ts            # 应用常量定义
│   │   ├── env.ts                  # 环境变量工具
│   │   ├── envValidator.ts         # 环境变量验证工具
│   │   ├── errorHandler.ts         # 统一错误处理工具
│   │   ├── logger.ts               # 结构化日志工具
│   │   ├── streamHandler.ts        # 流数据处理工具
│   │   └── styleConstants.ts       # 样式常量定义
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 应用入口文件
├── docker/                # Docker相关文件
│   ├── Dockerfile         # Docker镜像构建文件
│   ├── docker-compose.yml # Docker Compose配置
│   └── nginx.conf         # Nginx配置文件
├── scripts/               # 脚本文件
│   └── deploy.sh          # 自动部署脚本
├── dist/                  # 构建输出目录
├── node_modules/          # 依赖包目录
├── index.html             # HTML入口文件
├── package.json           # 项目依赖配置
├── package-lock.json      # 依赖版本锁定文件
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite构建配置
├── .dockerignore          # Docker忽略文件
├── .gitignore             # Git忽略文件
├── metadata.json          # 项目元数据
└── README.md              # 项目说明文档
```

## 技术栈

### 前端技术
- **React 19**: 最新React框架，支持并发特性
- **TypeScript 5.7**: 类型安全的JavaScript，增强开发体验
- **Vite 6.2**: 快速的现代化构建工具，支持HMR热重载
- **Tailwind CSS**: 实用优先的CSS框架，快速构建现代UI
- **React Syntax Highlighter**: 代码高亮显示组件
- **CodeMirror**: 专业的代码编辑器组件

### AI集成
- **Google Gemini API**: Gemini 2.5 Pro模型
- **OpenRouter API**: 提供多种AI模型接入
- **OpenAI API**: GPT-4.1等OpenAI模型

### 核心功能
- **React.lazy**: 组件懒加载，优化首屏性能
- **React Suspense**: 异步组件加载边界
- **Error Boundary**: 错误边界处理，增强应用稳定性
- **Custom Hooks**: 自定义Hook管理业务逻辑
- **Stream API**: 实时流式数据处理

### 部署技术
- **Docker**: 容器化部署，确保环境一致性
- **Nginx**: 高性能Web服务器
- **Docker Compose**: 容器编排和服务管理

## 部署与运维

### Docker部署优化
- **自动依赖解决**: 部署脚本自动解决esbuild版本冲突等常见问题
- **多阶段构建**: 使用多阶段Docker构建，减小镜像体积
- **健康检查**: 内置健康检查机制，确保服务可用性
- **配置管理**: 通过环境变量管理配置，支持不同环境部署

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

### v1.2.4 (最新) - 2025-01-23
- **组件优化**：
  - 完善错误边界组件，提供更好的错误恢复机制
  - 优化懒加载组件导入方式，提升首屏加载性能
  - 修复组件间prop传递问题，确保功能正常运行
- **开发体验改进**：
  - 修复所有TypeScript类型错误，提升开发时的类型安全
  - 完善组件导入导出，避免运行时错误
  - 优化HMR热重载兼容性，提升开发效率
- **OpenAI集成优化**：
  - 新增完整的OpenAI API支持，扩展AI模型选择范围
  - 更新OpenAI模型列表，集成最新的GPT-4.1模型
  - 移除不必要的日志记录导入，提升代码整洁性和准确性
- **核心功能改进**：
  - 修复基于可用API密钥自动选择默认模型的逻辑bug
  - 优化HTML输出格式，确保生成的网页包含完整的DOCTYPE声明
  - 修复TypeScript配置选项，提升代码质量检查
- **项目治理**：
  - 添加MIT开源许可证，明确项目使用条款
  - 规范commit message格式，提升开发协作效率

### v1.2.3
- **Docker部署优化**：
  - 解决esbuild版本冲突问题，优化Docker构建流程
  - 清理冗余的.dockerignore文件，简化配置管理
  - 改进Dockerfile，添加缓存清理和依赖重建机制
  - 升级到Vite 6.2.0，提升构建性能和稳定性
- **部署改进**：
  - 增强部署脚本的错误处理和状态检查
  - 添加自动健康检查和服务状态验证
  - 优化构建上下文配置，减少镜像体积
- **文档更新**：
  - 完善故障排除指南和常见问题解答
  - 添加详细的运维管理命令说明
  - 更新文件结构说明，反映最新的项目架构

### v1.2.2
- **代码质量优化**：
  - 创建统一的样式常量系统，消除重复的Tailwind CSS类定义
  - 实现生产环境日志系统，自动禁用调试日志
  - 添加React错误边界组件，提高应用稳定性
  - 集成环境变量验证，确保API密钥配置正确
- **性能优化**：
  - 为小组件添加React.memo优化，减少不必要的重渲染
  - 拆分大型组件（OutputDisplay），提高代码可维护性
  - 创建独立的PreviewLoader组件，优化加载体验
- **代码重构**：
  - 统一错误处理机制，提供友好的错误提示
  - 提取常量到专门的文件，便于维护和修改
  - 替换所有console日志为专业的日志系统
  - 优化TypeScript类型定义，增强类型安全

### v1.2.1
- 优化网站布局风格：采用Linear App风格为主，辅以灵活的网格布局
- 改进prompt模板，生成更现代化的展示网页
- 修复TypeScript编译警告
- 优化代码结构和性能

### v1.2.0
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