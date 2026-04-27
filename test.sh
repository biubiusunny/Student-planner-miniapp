#!/bin/bash

# 大学生规划小程序 - 功能测试脚本
# Usage: ./test.sh

echo "================================"
echo "大学生规划小程序 - 功能测试"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TOTAL=0
PASSED=0
FAILED=0

# 测试函数
test_item() {
    local description="$1"
    local command="$2"

    TOTAL=$((TOTAL + 1))
    echo -n "测试 $TOTAL: $description ... "

    if eval "$command" &> /dev/null; then
        echo -e "${GREEN}✅ 通过${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ 失败${NC}"
        FAILED=$((FAILED + 1))
    fi
}

echo "🔍 检查项目结构..."
echo ""

# 项目文件检查
test_item "package.json 存在" "[ -f package.json ]"
test_item "manifest.json 存在" "[ -f manifest.json ]"
test_item "pages.json 存在" "[ -f src/pages.json ]"
test_item "tsconfig.json 存在" "[ -f tsconfig.json ]"
test_item "vite.config.ts 存在" "[ -f vite.config.ts ]"
test_item "README.md 存在" "[ -f README.md ]"

echo ""
echo "🔍 检查依赖..."
echo ""

# 依赖检查
test_item "node_modules 存在" "[ -d node_modules ]"
test_item "package-lock.json 存在" "[ -f package-lock.json ]"

echo ""
echo "🔍 检查核心文件..."
echo ""

# 核心文件检查
test_item "logger.ts 存在" "[ -f src/utils/logger.ts ]"
test_item "storage.ts 存在" "[ -f src/utils/storage.ts ]"
test_item "notification.ts 存在" "[ -f src/utils/notification.ts ]"
test_item "audioPlayer.ts 存在" "[ -f src/utils/audioPlayer.ts ]"
test_item "types/index.ts 存在" "[ -f src/types/index.ts ]"

echo ""
echo "🔍 检查页面文件..."
echo ""

# 页面文件检查
test_item "首页 (index.vue) 存在" "[ -f src/pages/index/index.vue ]"
test_item "课程列表 (course/list.vue) 存在" "[ -f src/pages/course/list.vue ]"
test_item "课程添加 (course/add.vue) 存在" "[ -f src/pages/course/add.vue ]"
test_item "任务列表 (task/list.vue) 存在" "[ -f src/pages/task/list.vue ]"
test_item "任务添加 (task/add.vue) 存在" "[ -f src/pages/task/add.vue ]"
test_item "目标列表 (goal/index.vue) 存在" "[ -f src/pages/goal/index.vue ]"
test_item "目标创建 (goal/create.vue) 存在" "[ -f src/pages/goal/create.vue ]"
test_item "目标详情 (goal/detail.vue) 存在" "[ -f src/pages/goal/detail.vue ]"
test_item "专注模式 (focus/index.vue) 存在" "[ -f src/pages/focus/index.vue ]"
test_item "GPA计算器 (gpa/index.vue) 存在" "[ -f src/pages/gpa/index.vue ]"
test_item "个人中心 (profile/index.vue) 存在" "[ -f src/pages/profile/index.vue ]"
test_item "日志监控 (logs.vue) 存在" "[ -f src/pages/profile/logs.vue ]"
test_item "数据导出 (export.vue) 存在" "[ -f src/pages/profile/export.vue ]"
test_item "数据导入 (import.vue) 存在" "[ -f src/pages/profile/import.vue ]"

echo ""
echo "🔍 检查组件..."
echo ""

# 组件检查
test_item "音频播放器组件 存在" "[ -f src/components/AudioPlayer.vue ]"

echo ""
echo "🔍 检查配置文件..."
echo ""

# 配置文件检查
test_item "日志配置 (logging.config.json) 存在" "[ -f src/config/logging.config.json ]"

echo ""
echo "🔍 检查文档..."
echo ""

# 文档检查
test_item "部署文档 (DEPLOYMENT.md) 存在" "[ -f DEPLOYMENT.md ]"
test_item "日志文档 (LOGGING.md) 存在" "[ -f LOGGING.md ]"
test_item "日志示例 (LOGGING_EXAMPLES.md) 存在" "[ -f LOGGING_EXAMPLES.md ]"
test_item "Bug修复报告 (BUGFIXES.md) 存在" "[ -f BUGFIXES.md ]"

echo ""
echo "🔍 检查测试文件..."
echo ""

# 测试文件检查
test_item "单元测试 (unit.test.ts) 存在" "[ -f tests/unit.test.ts ]"
test_item "集成测试 (integration.test.ts) 存在" "[ -f tests/integration.test.ts ]"
test_item "验证测试 (verify-fixes.js) 存在" "[ -f tests/verify-fixes.js ]"

echo ""
echo "================================"
echo "📊 测试结果汇总"
echo "================================"
echo -e "总测试数: $TOTAL"
echo -e "${GREEN}✅ 通过: $PASSED${NC}"
echo -e "${RED}❌ 失败: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 所有检查通过！项目结构完整。${NC}"
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  有 $FAILED 项检查失败，请检查项目文件。${NC}"
    exit 1
fi
