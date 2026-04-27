# 大学生规划小程序

> 极简规划工具，专注于课程、任务、目标、专注

## 项目简介

面向在校大学生的轻量化规划工具，只做四件事：
- 📚 课程管理
- ✅ 任务管理
- 🎯 目标管理
- ⏱️ 专注模式

## 技术栈

- **框架**: uni-app (Vue 3 + TypeScript)
- **状态管理**: Pinia
- **日期处理**: dayjs
- **平台**: 微信小程序
- **存储**: 本地存储 (wx.setStorageSync)
- **推送**: 微信小程序订阅消息

## 项目结构

```
student-planner-miniapp/
├── src/
│   ├── api/              # API接口
│   ├── components/       # 公共组件
│   ├── pages/            # 页面
│   │   ├── index/        # 首页
│   │   ├── course/       # 课程管理
│   │   ├── task/         # 任务管理
│   │   ├── goal/         # 目标管理
│   │   ├── focus/        # 专注模式
│   │   ├── gpa/          # GPA计算器
│   │   ├── calendar/     # 日历视图
│   │   └── profile/      # 个人中心（含日志监控）
│   ├── config/           # 配置文件
│   ├── stores/           # 状态管理
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   │   ├── storage.ts    # 本地存储工具
│   │   ├── notification.ts # 订阅消息工具
│   │   ├── audioPlayer.ts # 音频播放器
│   │   └── logger.ts     # 日志系统
│   ├── static/           # 静态资源
│   │   ├── images/       # 图片
│   │   └── audio/        # 音频
│   ├── App.vue           # 应用入口
│   ├── main.ts           # 主入口文件
│   └── pages.json        # 页面配置
├── tests/                # 测试文件
├── manifest.json         # 应用配置
├── package.json          # 依赖配置
├── tsconfig.json         # TypeScript配置
└── vite.config.ts        # Vite配置
```

## 📚 文档导航

### 快速开始
- **QUICKSTART.md** - 5分钟快速部署指南（推荐新手）
- **start.sh** / **start.bat** - 一键启动脚本
- **test.sh** - 项目文件完整性测试

### 详细指南
- **DEPLOYMENT.md** - 完整的本地部署和测试指南
- **DEPLOYMENT_CHECKLIST.md** - 部署步骤检查清单

### 技术文档
- **BUGFIXES.md** - Bug修复和测试报告（含日志监控）
- **LOGGING.md** - 日志系统完整使用指南
- **LOGGING_EXAMPLES.md** - 日志使用示例代码

### 功能说明
- **DEVELOPMENT.md** - 开发指南和规范
- **SETUP_CHECKLIST.md** - 项目设置检查清单
- **SUBSCRIPTION_GUIDE.md** - 订阅消息配置指南
├── tsconfig.json         # TypeScript配置
├── vite.config.ts        # Vite配置
└── README.md             # 项目说明
```

## 核心功能

### 1. 课程管理
- ✅ 手动添加课程
- ✅ 周/日视图切换
- ✅ 单双周支持
- ✅ 课程提醒
- ✅ 调课/停课记录

### 2. 任务管理
- ✅ 学习/生活任务分类
- ✅ 优先级设置
- ✅ 子任务拆分
- ✅ DDL倒计时
- ✅ 关联课程

### 3. 目标管理
- ✅ 目标创建与拆解
- ✅ 进度条可视化
- ✅ 预设模板（四六级/考研/期末）
- ✅ 关联任务

### 4. 专注模式
- ✅ 自定义番茄钟
- ✅ 白噪音支持
- ✅ 关联任务
- ✅ 专注统计

### 5. 通用功能
- ✅ 统一日历视图
- ✅ 数据导出/导入
- ✅ 深色模式
- ✅ GPA计算器

## 快速开始

### 本地部署（推荐）

**方式1: 使用启动脚本（最简单）**

```bash
# Mac/Linux
chmod +x start.sh
./start.sh

# Windows
start.bat
```

**方式2: 使用HBuilderX**

详见 [DEPLOYMENT.md](./DEPLOYMENT.md) - 完整的本地部署和测试指南

**方式3: 手动命令**

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev:mp-weixin

# 3. 用微信开发者工具打开 dist/dev/mp-weixin 目录
```

### 功能测试

```bash
# Mac/Linux
chmod +x test.sh
./test.sh
```

测试内容:
- ✅ 项目文件完整性检查
- ✅ 依赖安装验证
- ✅ 核心文件检查
- ✅ 页面文件检查
- ✅ 组件和配置检查
- ✅ 文档完整性检查

详细测试清单请查看 [DEPLOYMENT.md](./DEPLOYMENT.md#-功能测试清单)

### 环境要求
- Node.js >= 14
- HBuilderX 或 VS Code
- 微信开发者工具

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
# HBuilderX
点击 运行 -> 运行到小程序模拟器 -> 微信开发者工具

# VS Code
npm run dev:mp-weixin
```

### 构建生产版本
```bash
npm run build:mp-weixin
```

## 配置说明

### 1. 微信小程序配置

在 `manifest.json` 中配置 `mp-weixin` 部分：

```json
{
  "mp-weixin": {
    "appid": "你的小程序AppID"
  }
}
```

### 2. 订阅消息配置

在 `src/utils/notification.ts` 中配置模板ID：

```typescript
export const TEMPLATE_IDS = {
  COURSE_REMINDER: '课程提醒模板ID',
  TASK_REMINDER: '任务提醒模板ID',
  GOAL_PROGRESS: '目标进度模板ID'
}
```

### 3. 主题配置

在应用设置中支持的主题模式：
- `light`: 浅色模式
- `dark`: 深色模式
- `auto`: 自动跟随系统

## 数据存储

所有数据使用微信小程序本地存储：

| 数据类型 | 存储Key | 数据结构 |
|---------|---------|----------|
| 课程 | `student_planner_courses` | `Course[]` |
| 任务 | `student_planner_tasks` | `Task[]` |
| 目标 | `student_planner_goals` | `Goal[]` |
| 专注记录 | `student_planner_focusSessions` | `FocusSession[]` |
| 成绩 | `student_planner_grades` | `Grade[]` |
| 设置 | `student_planner_settings` | `AppSettings` |

## 开发规范

### 1. 命名规范
- 组件文件：PascalCase (如 `TaskCard.vue`)
- 工具函数：camelCase (如 `formatDate`)
- 常量：UPPER_SNAKE_CASE (如 `TEMPLATE_IDS`)
- 类型定义：PascalCase (如 `Course`, `Task`)

### 2. 代码风格
- 使用 TypeScript 进行类型检查
- 使用 Composition API
- 组件使用 `<script setup lang="ts">` 语法
- 样式使用 SCSS

### 3. 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具变动
```

## MVP开发计划

### Week 1: 基础框架 + 课程管理
- [x] 项目初始化
- [x] 数据结构设计
- [x] 课程增删改查
- [x] 课表周/日视图
- [ ] 课程详情页
- [ ] 添加课程页面
- [ ] 调课/停课功能

### Week 2: 任务管理 + 目标管理
- [ ] 任务增删改查
- [ ] 任务详情页
- [ ] 添加任务页面
- [ ] 目标增删改查
- [ ] 目标详情页
- [ ] 创建目标页面
- [ ] 预设模板

### Week 3: 专注模式 + 核心优化
- [ ] 番茄钟功能
- [ ] 白噪音集成
- [ ] 与任务关联
- [ ] 今日待办汇总
- [ ] 统一日历视图

### Week 4: 体验优化 + 云同步
- [ ] 深色/浅色模式
- [ ] 数据导出/导入
- [ ] GPA计算器
- [ ] 订阅消息配置
- [ ] 测试与修复

## 注意事项

### 1. 订阅消息限制
- 用户需要主动授权才能接收订阅消息
- 模板消息需要在微信公众平台配置
- 小程序端无法直接发送，需要后端服务支持

### 2. 本地存储限制
- 单个key存储上限 10MB
- 总存储上限 10MB
- 建议定期清理过期数据

### 3. 性能优化
- 使用虚拟列表优化长列表渲染
- 图片资源压缩
- 合理使用缓存

## 常见问题

### Q: 如何添加新的页面？
A: 在 `pages.json` 中添加页面配置，然后在 `src/pages/` 下创建对应目录和文件。

### Q: 如何调试订阅消息？
A: 使用微信开发者工具的"模拟器订阅消息"功能，或在真机上测试。

### Q: 数据存储满了怎么办？
A: 实现数据导出功能，让用户定期备份旧数据，或实现自动清理机制。

## 许可证

MIT

## 作者

维尔斯 - 10年+ C++/C 开发经验的资深工程师

## 更新日志

### v1.0.0 (2026-03-29)
- 初始版本
- 完成基础框架搭建
- 完成核心数据结构设计
- 完成主要页面UI开发
- 完成本地存储工具封装

### v1.0.0 (2026-03-30) - 功能增强版
- ✅ 子任务排序功能
- ✅ 目标里程碑和进度记录
- ✅ 目标权重管理
- ✅ 表单自动保存
- ✅ GPA计算器（4.0制）
- ✅ 数据导入导出（JSON/CSV/Word/Excel）
- ✅ 白噪音音频播放
- ✅ 日志监控系统（新增）
- ✅ 今日待办优化
- ✅ Bug修复和测试验证
- ✅ 完善的部署文档
- ✅ 快速启动脚本

## 🚀 立即开始

### 方式1: 使用快速启动脚本（推荐）

**Windows:**
```bash
双击 start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

### 方式2: 查看快速入门指南

📖 **[QUICKSTART.md](./QUICKSTART.md)** - 5分钟快速部署指南

### 方式3: 查看完整部署文档

📖 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 完整的本地部署和测试指南

## 💡 需要帮助？

- 🚀 **快速开始**: 查看 [QUICKSTART.md](./QUICKSTART.md)
- 📋 **部署指南**: 查看 [DEPLOYMENT.md](./DEPLOYMENT.md)
- ✅ **检查清单**: 查看 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- 🐛 **Bug报告**: 查看 [BUGFIXES.md](./BUGFIXES.md)
- 📝 **日志文档**: 查看 [LOGGING.md](./LOGGING.md)
- 🔧 **开发指南**: 查看 [DEVELOPMENT.md](./DEVELOPMENT.md)

## 🎉 开始使用

1. 下载项目代码
2. 运行启动脚本
3. 用微信开发者工具打开
4. 开始使用大学生规划小程序！

---

**如有问题，请查阅文档或联系支持团队。祝使用愉快！**
- 完成订阅消息工具封装
