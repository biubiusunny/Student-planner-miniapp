#!/bin/bash

# 大学生规划小程序 - 快速启动脚本
# Usage: ./start.sh

echo "================================"
echo "大学生规划小程序 - 快速启动"
echo "================================"
echo ""

# 检查Node.js
echo "📦 检查Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js"
    echo "请从 https://nodejs.org/ 下载并安装 Node.js (v16+)"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 版本: $NODE_VERSION"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm 版本: $NPM_VERSION"
echo ""

# 检查项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 未找到package.json文件"
    echo "请确保在项目根目录下运行此脚本"
    exit 1
fi

echo "📂 项目目录: $(pwd)"
echo ""

# 安装依赖
echo "📥 安装依赖..."
if [ ! -d "node_modules" ]; then
    echo "首次安装，可能需要几分钟..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败，尝试使用淘宝镜像..."
        npm install --registry=https://registry.npmmirror.com
        if [ $? -ne 0 ]; then
            echo "❌ 依赖安装失败，请手动执行: npm install"
            exit 1
        fi
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已存在，跳过安装"
fi
echo ""

# 启动开发服务器
echo "🚀 启动开发服务器..."
echo ""
echo "================================"
echo "📝 接下来的步骤:"
echo "================================"
echo "1. 等待编译完成..."
echo "2. 打开微信开发者工具"
echo "3. 点击 '+' 导入项目"
echo "4. 选择目录: $(pwd)/dist/dev/mp-weixin"
echo "5. 填入小程序AppID (测试号或留空)"
echo "6. 点击导入"
echo ""
echo "提示: 使用 Ctrl+C 停止服务器"
echo "================================"
echo ""

npm run dev:mp-weixin

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ 启动失败"
    echo "请检查错误信息并重试"
    exit 1
fi
