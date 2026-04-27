# 微信小程序订阅消息配置指南

## 概述

本小程序使用微信小程序订阅消息功能，向用户发送课程提醒、任务截止提醒和目标进度通知。

## 配置步骤

### 1. 登录微信公众平台

访问 [微信公众平台](https://mp.weixin.qq.com/)，使用小程序管理员账号登录。

### 2. 进入订阅消息配置

1. 在左侧菜单中找到 `功能` → `订阅消息`
2. 点击 `选用` 或 `我的模板`

### 3. 创建订阅消息模板

#### 3.1 课程提醒模板

**模板标题**: 课程上课提醒

**模板内容示例**:
```
{{thing1.DATA}}
时间：{{date2.DATA}}
地点：{{thing3.DATA}}
教师：{{thing4.DATA}}
```

**字段说明**:
- `thing1`: 课程名称 (最多20字)
- `date2`: 上课时间 (格式: 2024-01-01 08:00)
- `thing3`: 上课地点 (最多20字)
- `thing4`: 教师姓名 (最多10字)

**模板ID**: 在创建后会自动生成，请复制保存

---

#### 3.2 任务提醒模板

**模板标题**: 任务截止提醒

**模板内容示例**:
```
{{thing1.DATA}}
截止时间：{{date2.DATA}}
优先级：{{thing3.DATA}}
```

**字段说明**:
- `thing1`: 任务名称 (最多20字)
- `date2`: 截止时间 (格式: 2024-01-01 23:59)
- `thing3`: 优先级 (最多5字，如: 高/中/低)

**模板ID**: 在创建后会自动生成，请复制保存

---

#### 3.3 目标进度模板

**模板标题**: 目标进度通知

**模板内容示例**:
```
{{thing1.DATA}}
当前进度：{{number1.DATA}}/{{number2.DATA}}
完成率：{{percent1.DATA}}
```

**字段说明**:
- `thing1`: 目标名称 (最多20字)
- `number1`: 当前进度 (数字)
- `number2`: 总进度 (数字)
- `percent1`: 完成百分比 (格式: 80%)

**模板ID**: 在创建后会自动生成，请复制保存

---

### 4. 配置项目中的模板ID

打开 `src/utils/notification.ts` 文件，将获取到的模板ID填入：

```typescript
export const TEMPLATE_IDS = {
  COURSE_REMINDER: '你的课程提醒模板ID',
  TASK_REMINDER: '你的任务提醒模板ID',
  GOAL_PROGRESS: '你的目标进度模板ID',
} as const
```

### 5. 测试订阅消息

#### 5.1 在开发者工具中测试

1. 打开微信开发者工具
2. 进入 `订阅消息` 功能模块
3. 点击 `获取订阅消息模板ID`
4. 选择要测试的模板
5. 模拟发送消息

#### 5.2 在真机上测试

1. 在小程序中进入 `我的` → `设置` → `订阅消息管理`
2. 点击 `一键订阅全部`
3. 允许订阅权限
4. 等待触发提醒

### 6. 后端服务（可选）

由于微信小程序订阅消息需要通过后端服务调用微信API发送，当前实现为：

#### 方案A: 纯前端实现（当前方案）

- 使用 `wx.showToast` 和 `wx.vibrateShort` 作为本地提醒
- 适合个人使用，无需后端服务
- 限制：只能在打开小程序时收到提醒

#### 方案B: 接入后端服务

需要实现后端服务来发送订阅消息：

```typescript
// 后端API示例
export async function sendSubscriptionMessage(data: {
  touser: string  // 用户openid
  template_id: string  // 模板ID
  page: string  // 小程序页面路径
  data: Record<string, { value: string }>  // 模板数据
}) {
  const response = await fetch('https://api.weixin.qq.com/cgi-bin/message/subscribe/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data)
  })
  return response.json()
}
```

## 订阅消息使用流程

### 1. 用户授权

用户首次使用时，需要授权订阅消息：

```typescript
await requestSubscribeMessage([templateId])
```

### 2. 保存订阅状态

授权成功后，保存用户的订阅状态：

```typescript
const settings = uni.getStorageSync('student_planner_settings')
settings.subscriptions[templateId] = true
uni.setStorageSync('student_planner_settings', settings)
```

### 3. 定时检查提醒

使用定时器检查需要提醒的事项：

```typescript
setInterval(() => {
  checkReminders()
}, 5 * 60 * 1000) // 每5分钟检查一次
```

### 4. 发送提醒

当检测到需要提醒的事项时：

```typescript
if (shouldRemind) {
  showLocalNotification('标题', '内容')
  if (settings.enableVibration) {
    uni.vibrateShort()
  }
}
```

## 注意事项

### 1. 订阅有效期

- 每次订阅的最长有效期为90天
- 过期后需要用户重新授权
- 建议在订阅即将过期时提示用户

### 2. 发送次数限制

- 每个用户每天最多接收3次订阅消息
- 需要合理控制发送频率

### 3. 模板审核

- 新创建的模板需要审核通过后才能使用
- 审核通常需要1-3个工作日

### 4. 用户隐私

- 订阅消息只能发送给授权的用户
- 需要获取用户的openid

### 5. 服务端调用

- 订阅消息只能通过服务端API调用
- 不能直接从前端发送
- 需要使用小程序的access_token

## 常见问题

### Q1: 订阅消息发送失败？

可能原因：
1. 模板未审核通过
2. 模板ID配置错误
3. access_token过期
4. 用户未授权或授权已过期
5. 超过每日发送次数限制

### Q2: 如何获取用户openid？

```typescript
uni.login({
  success: (res) => {
    if (res.code) {
      // 将code发送到后端，换取openid
      // 或使用云开发
    }
  }
})
```

### Q3: 订阅消息什么时候会失效？

- 用户主动取消订阅
- 订阅超过90天有效期
- 用户删除小程序

### Q4: 如何提高订阅率？

1. 在用户首次使用时引导订阅
2. 提供一键订阅全部功能
3. 在订阅即将过期时提醒用户重新订阅
4. 说明订阅的价值和好处

## 参考文档

- [微信小程序订阅消息文档](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/subscribe-message/subscribeMessage.html)
- [订阅消息模板规范](https://developers.weixin.qq.com/miniprogram/dev/framework/server-ability/message-push.html)

## 总结

1. ✅ 在微信公众平台创建订阅消息模板
2. ✅ 将模板ID配置到项目中
3. ✅ 引导用户授权订阅
4. ✅ 实现定时检查提醒逻辑
5. ✅ 发送提醒通知

当前项目已完成订阅消息的基础框架，配置好模板ID后即可正常使用。
