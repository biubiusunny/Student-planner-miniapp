# 开发指南

## 环境配置

### 1. 安装HBuilderX
下载并安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)

推荐安装插件：
- uni-app编译器
- TypeScript语法支持
- SCSS/SASS编译
- uni-ui

### 2. 安装微信开发者工具
下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 3. 项目初始化
```bash
cd student-planner-miniapp
npm install
```

### 4. 配置微信小程序AppID
在 `manifest.json` 中填写你的小程序AppID：
```json
{
  "mp-weixin": {
    "appid": "wx你的AppID"
  }
}
```

## 开发流程

### 1. 启动开发服务器
使用HBuilderX：
- 打开项目
- 点击 运行 -> 运行到小程序模拟器 -> 微信开发者工具

使用命令行：
```bash
npm run dev:mp-weixin
```

### 2. 修改代码后
- HBuilderX会自动编译
- 微信开发者工具会自动刷新

### 3. 调试技巧
- 使用微信开发者工具的控制台查看日志
- 使用 `console.log` 输出调试信息
- 使用断点调试

## 页面开发规范

### 1. 页面结构
```vue
<template>
  <view class="container">
    <!-- 页面内容 -->
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 数据
const data = ref('')

// 计算属性
const computedData = computed(() => {
  return data.value.toUpperCase()
})

// 生命周期
onMounted(() => {
  initData()
})

// 方法
function initData() {
  // 初始化逻辑
}
</script>

<style lang="scss" scoped>
.container {
  // 样式
}
</style>
```

### 2. 路由跳转
```typescript
// 跳转到TabBar页面
uni.switchTab({
  url: '/pages/index/index'
})

// 跳转到普通页面
uni.navigateTo({
  url: '/pages/course/detail?id=123'
})

// 返回上一页
uni.navigateBack()

// 重定向
uni.redirectTo({
  url: '/pages/login/index'
})
```

### 3. 获取参数
```typescript
onLoad((options) => {
  const id = options.id
  console.log(id)
})
```

## 数据存储规范

### 1. 使用封装的存储工具
```typescript
import { courseStorage, taskStorage } from '@/utils/storage'

// 添加课程
courseStorage.add(course)

// 获取所有课程
const courses = courseStorage.getAll()

// 更新课程
courseStorage.update(course)

// 删除课程
courseStorage.delete(courseId)
```

### 2. 数据结构
所有数据结构定义在 `src/types/index.ts` 中

## 组件开发规范

### 1. 公共组件位置
放在 `src/components/` 目录下

### 2. 组件命名
使用 PascalCase，如 `TaskCard.vue`

### 3. 组件使用
```vue
<template>
  <TaskCard :task="task" @delete="handleDelete" />
</template>

<script setup lang="ts">
import TaskCard from '@/components/TaskCard.vue'

function handleDelete(taskId: string) {
  // 处理删除
}
</script>
```

## 工具函数使用

### 1. 通用工具
```typescript
import {
  generateId,
  formatDateTime,
  formatRelativeTime,
  showSuccess,
  showError
} from '@/utils'

// 生成ID
const id = generateId()

// 格式化时间
const time = formatDateTime(new Date())

// 显示提示
showSuccess('操作成功')
```

### 2. 存储工具
```typescript
import { courseStorage, taskStorage, goalStorage } from '@/utils/storage'

// 获取数据
const courses = courseStorage.getAll()

// 保存数据
courseStorage.add(newCourse)
```

### 3. 订阅消息工具
```typescript
import { requestSubscribeMessage, showLocalNotification } from '@/utils/notification'

// 请求订阅权限
await requestSubscribeMessage(['templateId'])

// 显示本地通知
showLocalNotification('标题', '内容')
```

## 样式规范

### 1. 使用SCSS
```scss
<style lang="scss" scoped>
.container {
  display: flex;
  padding: 16rpx;

  .item {
    color: #333;
  }
}
</style>
```

### 2. 使用rpx单位
rpx是响应式像素，750rpx = 屏幕宽度

### 3. 主题变量
```scss
// 浅色主题
$bg-color: #f5f5f5;
$text-color: #333;
$primary-color: #007AFF;

// 深色主题
@media (prefers-color-scheme: dark) {
  $bg-color: #1a1a1a;
  $text-color: #fff;
}
```

## 类型定义规范

### 1. 使用TypeScript
```typescript
import type { Course, Task, Goal } from '@/types'

const course: Course = {
  id: generateId(),
  name: '高等数学',
  teacher: '张老师',
  classroom: '教一101',
  dayOfWeek: 1,
  startSection: 1,
  endSection: 2,
  weekType: 'all',
  semester: '2024-2025-2',
  createTime: new Date().toISOString(),
  updateTime: new Date().toISOString()
}
```

### 2. 自定义类型
在 `src/types/index.ts` 中定义

## 测试规范

### 1. 功能测试
- 在微信开发者工具中测试
- 在真机上测试

### 2. 性能测试
- 检查页面加载时间
- 检查内存占用
- 检查包大小

### 3. 兼容性测试
- 测试不同iOS版本
- 测试不同Android版本
- 测试不同屏幕尺寸

## 发布流程

### 1. 构建生产版本
```bash
npm run build:mp-weixin
```

### 2. 上传代码
在微信开发者工具中：
- 点击 上传
- 填写版本号和备注
- 确认上传

### 3. 提交审核
在微信小程序后台：
- 开发管理 -> 开发版本
- 点击 提交审核
- 填写审核信息

### 4. 发布
审核通过后：
- 开发管理 -> 审核版本
- 点击 发布

## 注意事项

### 1. 性能优化
- 避免频繁调用 `uni.setStorageSync`
- 合理使用计算属性
- 图片资源压缩

### 2. 内存管理
- 及时清理定时器
- 避免内存泄漏
- 合理使用缓存

### 3. 错误处理
- 使用 try-catch 捕获异常
- 给用户友好的错误提示
- 记录错误日志

### 4. 安全性
- 验证用户输入
- 不要存储敏感信息
- 使用HTTPS请求

## 常见问题

### Q: 如何调试订阅消息？
A: 使用微信开发者工具的"模拟器订阅消息"功能

### Q: 如何优化包大小？
A:
- 压缩图片资源
- 移除未使用的依赖
- 使用分包加载

### Q: 如何实现数据同步？
A: 本项目使用本地存储，如需云同步需接入云服务或自建后端

### Q: 如何添加新的图标？
A:
- 使用uni-ui的图标组件
- 或使用自定义SVG图标
- 或使用图片资源

## 相关资源

- [uni-app官方文档](https://uniapp.dcloud.net.cn/)
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Vue 3文档](https://cn.vuejs.org/)
- [TypeScript文档](https://www.typescriptlang.org/zh/)
- [dayjs文档](https://dayjs.fenxianglu.cn/)
