#!/bin/bash

# AI Website Generator Docker 部署脚本
# 使用方法: ./scripts/deploy.sh

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 未安装或不在PATH中"
        return 1
    fi
}

# 检查前置条件
check_prerequisites() {
    print_message "检查前置条件..."
    
    check_command "docker" || exit 1
    check_command "docker-compose" || check_command "docker" && docker compose version &> /dev/null || exit 1
    
    print_success "前置条件检查通过"
}

# 检查环境变量文件
check_env_file() {
    print_message "检查环境变量配置..."
    
    # 优先检查.env.local文件（开发环境常用）
    if [ -f ".env.local" ]; then
        print_message "发现 .env.local 文件"
        source .env.local
        
        # 检查 Gemini API key
        if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_api_key_here" ]; then
            print_warning "GEMINI_API_KEY 未设置或无效"
        else
            print_success "GEMINI_API_KEY 已配置"
        fi

        # 检查 OpenRouter API key
        if [ -z "$OPENROUTER_API_KEY" ] || [ "$OPENROUTER_API_KEY" = "your_api_key_here" ]; then
            print_warning "OPENROUTER_API_KEY 未设置或无效"
        else
            print_success "OPENROUTER_API_KEY 已配置"
        fi

        # 检查 OpenAI API key
        if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_api_key_here" ]; then
            print_warning "OPENAI_API_KEY 未设置或无效"
        else
            print_success "OPENAI_API_KEY 已配置"
        fi
        
        # 至少需要一个API密钥
        if ([ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_api_key_here" ]) && ([ -z "$OPENROUTER_API_KEY" ] || [ "$OPENROUTER_API_KEY" = "your_api_key_here" ]) && ([ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_api_key_here" ]); then
            print_error "请在 .env.local 文件中至少设置一个有效的 API 密钥（GEMINI_API_KEY、OPENROUTER_API_KEY 或 OPENAI_API_KEY）"
            exit 1
        fi
        
        print_success "使用现有的 .env.local 文件"
        return 0
    fi
    
    # 检查.env文件
    if [ ! -f ".env" ]; then
        print_warning ".env 和 .env.local 文件都不存在"
        echo
        print_message "请创建环境变量文件并设置 API 密钥"
        echo "示例："
        echo "GEMINI_API_KEY=your_gemini_api_key_here"
        echo "OPENROUTER_API_KEY=your_openrouter_api_key_here"
        echo "OPENAI_API_KEY=your_openai_api_key_here"
        echo
        read -p "创建 .env.local 文件 (开发推荐) 还是 .env 文件? (local/env): " file_choice
        
        if [ "$file_choice" = "local" ]; then
            read -p "请输入你的 Gemini API 密钥 (可选，回车跳过): " gemini_key
            read -p "请输入你的 OpenRouter API 密钥 (可选，回车跳过): " openrouter_key
            read -p "请输入你的 OpenAI API 密钥 (可选，回车跳过): " openai_key
            
            if [ -z "$gemini_key" ] && [ -z "$openrouter_key" ] && [ -z "$openai_key" ]; then
                print_error "至少需要提供一个 API 密钥"
                exit 1
            fi
            
            {
                [ ! -z "$gemini_key" ] && echo "GEMINI_API_KEY=$gemini_key"
                [ ! -z "$openrouter_key" ] && echo "OPENROUTER_API_KEY=$openrouter_key"
                [ ! -z "$openai_key" ] && echo "OPENAI_API_KEY=$openai_key"
            } > .env.local
            print_success ".env.local 文件已创建"
        else
            read -p "请输入你的 Gemini API 密钥 (可选，回车跳过): " gemini_key
            read -p "请输入你的 OpenRouter API 密钥 (可选，回车跳过): " openrouter_key
            read -p "请输入你的 OpenAI API 密钥 (可选，回车跳过): " openai_key
            
            if [ -z "$gemini_key" ] && [ -z "$openrouter_key" ] && [ -z "$openai_key" ]; then
                print_error "至少需要提供一个 API 密钥"
                exit 1
            fi
            
            {
                [ ! -z "$gemini_key" ] && echo "GEMINI_API_KEY=$gemini_key"
                [ ! -z "$openrouter_key" ] && echo "OPENROUTER_API_KEY=$openrouter_key"
                [ ! -z "$openai_key" ] && echo "OPENAI_API_KEY=$openai_key"
            } > .env
            print_success ".env 文件已创建"
        fi
    else
        # 检查.env文件中的API密钥
        source .env
        
        # 检查 Gemini API key
        if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_api_key_here" ]; then
            print_warning "GEMINI_API_KEY 未设置或无效"
        else
            print_success "GEMINI_API_KEY 已配置"
        fi
        
        # 检查 OpenRouter API key
        if [ -z "$OPENROUTER_API_KEY" ] || [ "$OPENROUTER_API_KEY" = "your_api_key_here" ]; then
            print_warning "OPENROUTER_API_KEY 未设置或无效"
        else
            print_success "OPENROUTER_API_KEY 已配置"
        fi

        # 检查 OpenAI API key
        if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_api_key_here" ]; then
            print_warning "OPENAI_API_KEY 未设置或无效"
        else
            print_success "OPENAI_API_KEY 已配置"
        fi
        
        # 至少需要一个API密钥
        if ([ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_api_key_here" ]) && ([ -z "$OPENROUTER_API_KEY" ] || [ "$OPENROUTER_API_KEY" = "your_api_key_here" ]) && ([ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_api_key_here" ]); then
            print_error "请在 .env 文件中至少设置一个有效的 API 密钥（GEMINI_API_KEY、OPENROUTER_API_KEY 或 OPENAI_API_KEY）"
            exit 1
        fi
        
        print_success "使用现有的 .env 文件"
    fi
}

# 停止现有容器
stop_existing() {
    print_message "停止现有容器..."
    
    # 确保环境变量被导出（避免docker-compose警告）
    if [ -f ".env.local" ]; then
        set -a
        source .env.local
        set +a
    elif [ -f ".env" ]; then
        set -a
        source .env
        set +a
    fi
    
    if docker-compose -f docker/docker-compose.yml ps | grep -q "ai-website-generator"; then
        docker-compose -f docker/docker-compose.yml down
        print_success "现有容器已停止"
    else
        print_message "没有发现运行中的容器"
    fi
}

# 构建和启动
build_and_start() {
    print_message "构建应用镜像..."
    
    # 确保环境变量被导出
    if [ -f ".env.local" ]; then
        # 使用更安全的方式导出环境变量
        set -a  # 自动导出所有变量
        source .env.local
        set +a  # 关闭自动导出
    elif [ -f ".env" ]; then
        set -a
        source .env
        set +a
    fi
    
    # 验证环境变量已导出
    if [ ! -z "$GEMINI_API_KEY" ]; then
        print_message "GEMINI_API_KEY 已设置"
    fi
    if [ ! -z "$OPENROUTER_API_KEY" ]; then
        print_message "OPENROUTER_API_KEY 已设置"
    fi
    if [ ! -z "$OPENAI_API_KEY" ]; then
        print_message "OPENAI_API_KEY 已设置"
    fi
    
    docker-compose -f docker/docker-compose.yml build --no-cache
    
    print_message "启动应用容器..."
    docker-compose -f docker/docker-compose.yml up -d
    
    print_success "应用容器已启动"
}

# 等待应用就绪
wait_for_app() {
    print_message "等待应用启动..."
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8080/health > /dev/null 2>&1; then
            print_success "应用已就绪！"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    echo
    print_warning "应用启动可能需要更多时间，请手动检查"
    return 1
}

# 显示部署信息
show_deployment_info() {
    echo
    echo "=================================="
    print_success "部署完成！"
    echo "=================================="
    echo
    echo "🌐 应用访问地址: http://localhost:8080"
    echo "🔍 健康检查: http://localhost:8080/health"
    echo
    echo
    echo "📋 常用命令:"
    echo "  查看日志: docker-compose -f docker/docker-compose.yml logs -f"
    echo "  重启应用: docker-compose -f docker/docker-compose.yml restart"
    echo "  停止应用: docker-compose -f docker/docker-compose.yml down"
    echo "  更新应用: ./scripts/deploy.sh"
    echo
}

# 主函数
main() {
    echo "========================================"
    echo "  AI Website Generator Docker 部署"
    echo "========================================"
    echo
    
    check_prerequisites
    check_env_file
    stop_existing
    build_and_start
    
    if wait_for_app; then
        show_deployment_info
    else
        echo
        print_message "检查容器状态: docker-compose -f docker/docker-compose.yml ps"
        print_message "查看日志: docker-compose -f docker/docker-compose.yml logs"
    fi
}

# 运行主函数
main "$@" 