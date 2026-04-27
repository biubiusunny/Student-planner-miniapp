@echo off
REM 大学生规划小程序 - 快速启动脚本 (Windows)
REM Usage: start.bat

chcp 65001 >nul
echo ================================
echo 大学生规划小程序 - 快速启动
echo ================================
echo.

REM 检查Node.js
echo 📦 检查Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Node.js
    echo 请从 https://nodejs.org/ 下载并安装 Node.js (v16+)
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js 版本: %NODE_VERSION%

REM 检查npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到npm
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm 版本: %NPM_VERSION%
echo.

REM 检查项目目录
if not exist "package.json" (
    echo ❌ 错误: 未找到package.json文件
    echo 请确保在项目根目录下运行此脚本
    pause
    exit /b 1
)

echo 📂 项目目录: %cd%
echo.

REM 安装依赖
echo 📥 安装依赖...
if not exist "node_modules" (
    echo 首次安装，可能需要几分钟...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败，尝试使用淘宝镜像...
        call npm install --registry=https://registry.npmmirror.com
        if %errorlevel% neq 0 (
            echo ❌ 依赖安装失败，请手动执行: npm install
            pause
            exit /b 1
        )
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已存在，跳过安装
)
echo.

REM 启动开发服务器
echo 🚀 启动开发服务器...
echo.
echo ================================
echo 📝 接下来的步骤:
echo ================================
echo 1. 等待编译完成...
echo 2. 打开微信开发者工具
echo 3. 点击 '+' 导入项目
echo 4. 选择目录: %cd%\dist\dev\mp-weixin
echo 5. 填入小程序AppID (测试号或留空)
echo 6. 点击导入
echo.
echo 提示: 使用 Ctrl+C 停止服务器
echo ================================
echo.

npm run dev:mp-weixin

if %errorlevel% neq 0 (
    echo.
    echo ❌ 启动失败
    echo 请检查错误信息并重试
    pause
    exit /b 1
)
