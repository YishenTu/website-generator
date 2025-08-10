# 多阶段构建 Dockerfile
# 阶段1: 构建应用
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 清理并安装依赖，确保重新下载适合当前平台的esbuild二进制文件
RUN npm cache clean --force && \
    npm ci && \
    npx esbuild --version

# 复制源代码
COPY . .

# 接收构建时的环境变量
ARG GEMINI_API_KEY
ARG OPENROUTER_API_KEY
ARG OPENAI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV OPENROUTER_API_KEY=$OPENROUTER_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY

# 构建应用
RUN npm run build

# 阶段2: 生产环境
FROM nginx:alpine

# 复制自定义nginx配置
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 从构建阶段复制构建结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露8080端口
EXPOSE 8080

# 启动nginx
CMD ["nginx", "-g", "daemon off;"] 