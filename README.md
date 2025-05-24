# AI网站生成器

基于AI的智能网站生成器，只需输入文本报告，即可生成完整的网站。

## 快速开始指南

想要快速部署AI网站生成器？跟着这个指南，3步搞定！

### 超快部署 (推荐)

#### 1. 获取API密钥
访问 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取免费的Gemini API密钥

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

就这么简单！

## 本地开发

如果你想在本地开发环境中运行：

**前置要求**: Node.js

1. 安装依赖:
   ```bash
   npm install
   ```
2. 在 `.env.local` 文件中设置 `GEMINI_API_KEY`
3. 运行应用:
   ```bash
   npm run dev
   ```

## Docker部署指南

### 前置要求

- Docker (版本 20.10+)
- Docker Compose (版本 2.0+)
- Gemini API 密钥

### 详细部署步骤

#### 1. 获取 Gemini API 密钥

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 创建新的API密钥
3. 保存密钥供后续使用

#### 2. 设置环境变量

在项目根目录创建环境变量文件，可以选择以下任一方式：

**方式1: 创建 .env.local 文件（开发环境推荐）**
```bash
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env.local
```

**方式2: 创建 .env 文件**
```bash
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
```

**重要**: 请将 `your_actual_api_key_here` 替换为你的真实API密钥。

**注意**: 系统会优先使用 `.env.local` 文件（如果存在）。

#### 3. 构建和运行应用

##### 方法1: 使用 Docker Compose (推荐)

```bash
# 构建并启动容器
docker-compose -f docker/docker-compose.yml up -d

# 查看日志
docker-compose -f docker/docker-compose.yml logs -f

# 停止容器
docker-compose -f docker/docker-compose.yml down
```

##### 方法2: 使用 Docker 命令

```bash
# 构建镜像
docker build -f docker/Dockerfile -t ai-website-generator .

# 运行容器
docker run -d \
  --name ai-website-generator \
  -p 8080:80 \
  -e GEMINI_API_KEY=your_actual_api_key_here \
  --restart unless-stopped \
  ai-website-generator
```

##### 方法3: 手动部署 (备选方案)

如果你喜欢手动控制，也可以这样做：

```bash
# 1. 创建环境变量文件 (二选一)
echo "GEMINI_API_KEY=你的API密钥" > .env.local  # 开发环境推荐
# 或者
echo "GEMINI_API_KEY=你的API密钥" > .env

# 2. 启动应用
docker-compose -f docker/docker-compose.yml up -d

# 3. 查看状态
docker-compose -f docker/docker-compose.yml ps
```

#### 4. 访问应用

应用启动后，在浏览器中访问：
- **本地访问**: http://localhost:8080

## 验证部署

访问以下地址确认部署成功：
- **应用首页**: http://localhost:8080
- **健康检查**: http://localhost:8080/health (应该返回 "healthy")

## 常用操作

### 管理容器

```bash
# 查看应用日志
docker-compose -f docker/docker-compose.yml logs -f

# 重启应用
docker-compose -f docker/docker-compose.yml restart

# 停止应用
docker-compose -f docker/docker-compose.yml down

# 更新应用 (重新部署)
./scripts/deploy.sh

# 查看容器状态
docker-compose -f docker/docker-compose.yml ps

# 重启应用
docker-compose -f docker/docker-compose.yml restart ai-website-generator

# 更新应用
docker-compose -f docker/docker-compose.yml up -d --build

# 完全清理
docker-compose -f docker/docker-compose.yml down
docker rmi ai-website-generator  # 删除镜像（可选）
```

### 查看资源使用情况
```bash
docker stats ai-website-generator
```

## 健康检查

应用包含健康检查端点：
- **健康检查URL**: http://localhost:8080/health

你可以使用以下命令检查应用状态：
```bash
curl http://localhost:8080/health
```

## 生产环境部署

### 使用不同端口
如果需要在不同端口运行，修改 `docker/docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "3000:80"  # 使用3000端口
```

### 使用外部nginx代理
如果你有外部的nginx代理，可以直接使用容器的80端口：
```yaml
ports:
  - "80"  # 不指定主机端口，让Docker自动分配
```

### 环境变量安全
在生产环境中，建议使用Docker secrets或者外部密钥管理服务：
```yaml
secrets:
  gemini_api_key:
    external: true
```

## 监控和日志

### 持久化日志
如果需要持久化nginx日志，可以添加卷挂载：
```yaml
volumes:
  - ./logs:/var/log/nginx
```

## 故障排除

### 端口被占用
如果8080端口被占用，修改 `docker/docker-compose.yml` 中的端口：
```yaml
ports:
  - "3000:80"  # 改为3000端口
```

### API密钥错误
确保你的API密钥有效：
1. 检查 `.env` 文件中的密钥
2. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey) 确认密钥状态
3. 重启容器：`docker-compose -f docker/docker-compose.yml restart`

### 应用无法访问
1. 检查容器是否正在运行：`docker-compose -f docker/docker-compose.yml ps`
2. 检查端口是否正确映射
3. 检查防火墙设置

### 构建失败
清理Docker缓存后重试：
```bash
docker system prune
./scripts/deploy.sh
```

或者：
1. 确保网络连接正常
2. 清理Docker缓存：`docker system prune`
3. 重新构建：`docker-compose -f docker/docker-compose.yml build --no-cache`

## 功能特性

部署成功后，你可以：
1. 输入任何文本报告
2. 让AI生成网站规划
3. 生成漂亮的网站
4. 通过聊天进一步优化

## 文件结构

```
ai-website-generator-from-report/
├── src/                    # 源代码目录
│   ├── components/         # React组件
│   ├── services/          # 服务层代码
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

## 安全注意事项

1. **API密钥安全**: 永远不要将API密钥提交到版本控制系统
2. **容器更新**: 定期更新基础镜像以获取安全补丁
3. **网络隔离**: 在生产环境中使用适当的网络隔离
4. **日志管理**: 确保敏感信息不会记录在日志中

## 获取帮助

如果遇到问题，请检查：
1. Docker和Docker Compose的版本
2. 系统资源是否充足
3. 网络连接是否正常
4. API密钥是否有效

---

**提示**: 第一次构建可能需要几分钟时间下载依赖，请耐心等待。
