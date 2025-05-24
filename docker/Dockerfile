# 多阶段构建 Dockerfile
# 阶段1: 构建应用
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（包括开发依赖，构建时需要）
RUN npm ci

# 复制源代码
COPY . .

# 接收构建时的环境变量
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# 构建应用
RUN npm run build

# 阶段2: 生产环境
FROM nginx:alpine

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 从构建阶段复制构建结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"] 