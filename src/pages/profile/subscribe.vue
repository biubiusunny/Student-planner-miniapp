<template>
  <view class="container">
    <view class="header">
      <text class="title">消息订阅</text>
      <text class="subtitle">开启订阅，不错过任何提醒</text>
    </view>

    <!-- 订阅列表 -->
    <view class="subscribe-list">
      <view class="subscribe-item">
        <view class="item-left">
          <view class="item-icon" style="background: #007AFF;">
            <uni-icons type="calendar" size="24" color="#fff" />
          </view>
          <view class="item-info">
            <text class="item-title">课程提醒</text>
            <text class="item-desc">上课前提醒课程信息</text>
          </view>
        </view>
        <view class="item-right">
          <switch
            :checked="subscriptions.course"
            color="#007AFF"
            @change="toggleSubscription('course', $event)"
          />
        </view>
      </view>

      <view class="subscribe-item">
        <view class="item-left">
          <view class="item-icon" style="background: #34C759;">
            <uni-icons type="list" size="24" color="#fff" />
          </view>
          <view class="item-info">
            <text class="item-title">任务提醒</text>
            <text class="item-desc">任务截止前提醒</text>
          </view>
        </view>
        <view class="item-right">
          <switch
            :checked="subscriptions.task"
            color="#007AFF"
            @change="toggleSubscription('task', $event)"
          />
        </view>
      </view>

      <view class="subscribe-item">
        <view class="item-left">
          <view class="item-icon" style="background: #FF9500;">
            <uni-icons type="flag" size="24" color="#fff" />
          </view>
          <view class="item-info">
            <text class="item-title">目标进度</text>
            <text class="item-desc">目标达成时通知</text>
          </view>
        </view>
        <view class="item-right">
          <switch
            :checked="subscriptions.goal"
            color="#007AFF"
            @change="toggleSubscription('goal', $event)"
          />
        </view>
      </view>
    </view>

    <!-- 说明区域 -->
    <view class="info-section">
      <view class="info-title">
        <uni-icons type="info" size="18" color="#007AFF" />
        <text>订阅说明</text>
      </view>
      <text class="info-text">
        • 订阅后，重要事项将通过微信服务通知推送
        • 每次订阅有效期最多90天，过期需重新订阅
        • 您可以在设置中随时关闭订阅
        • 课程/任务/目标的提醒时间可在设置中调整
      </text>
    </view>

    <!-- 一键订阅按钮 -->
    <view class="action-section">
      <view class="btn primary" @tap="subscribeAll">
        <text>一键订阅全部</text>
      </view>
      <view class="btn secondary" @tap="cancelAll">
        <text>取消全部订阅</text>
      </view>
    </view>

    <!-- 状态说明 -->
    <view class="status-section">
      <view class="status-item">
        <uni-icons type="checkmarkempty" size="16" :color="subscriptions.course ? '#34C759' : '#ccc'" />
        <text>课程提醒：{{ subscriptions.course ? '已订阅' : '未订阅' }}</text>
      </view>
      <view class="status-item">
        <uni-icons type="checkmarkempty" size="16" :color="subscriptions.task ? '#34C759' : '#ccc'" />
        <text>任务提醒：{{ subscriptions.task ? '已订阅' : '未订阅' }}</text>
      </view>
      <view class="status-item">
        <uni-icons type="checkmarkempty" size="16" :color="subscriptions.goal ? '#34C759' : '#ccc'" />
        <text>目标进度：{{ subscriptions.goal ? '已订阅' : '未订阅' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TEMPLATE_IDS, requestSubscribeMessage } from '@/utils/notification'

// ==================== 数据 ====================
const subscriptions = ref({
  course: false,
  task: false,
  goal: false
})

// ==================== 生命周期 ====================
onMounted(() => {
  loadSubscriptions()
})

// ==================== 方法 ====================

/**
 * 加载订阅状态
 */
function loadSubscriptions() {
  const settings = uni.getStorageSync('student_planner_settings') || {}
  subscriptions.value = {
    course: !!settings.subscriptions?.[TEMPLATE_IDS.COURSE_REMINDER],
    task: !!settings.subscriptions?.[TEMPLATE_IDS.TASK_REMINDER],
    goal: !!settings.subscriptions?.[TEMPLATE_IDS.GOAL_PROGRESS]
  }
}

/**
 * 切换单个订阅
 */
async function toggleSubscription(
  type: 'course' | 'task' | 'goal',
  event: { detail: { value: boolean } }
) {
  const isEnabled = event.detail.value

  if (isEnabled) {
    // 开启订阅
    await subscribeSingle(type)
  } else {
    // 关闭订阅
    unsubscribeSingle(type)
  }
}

/**
 * 订阅单个类型
 */
async function subscribeSingle(type: 'course' | 'task' | 'goal'): Promise<void> {
  let templateId = ''

  switch (type) {
    case 'course':
      templateId = TEMPLATE_IDS.COURSE_REMINDER
      break
    case 'task':
      templateId = TEMPLATE_IDS.TASK_REMINDER
      break
    case 'goal':
      templateId = TEMPLATE_IDS.GOAL_PROGRESS
      break
  }

  if (!templateId) {
    uni.showToast({
      title: '模板ID未配置',
      icon: 'none'
    })
    return
  }

  try {
    await requestSubscribeMessage([templateId])

    // 更新订阅状态
    const settings = uni.getStorageSync('student_planner_settings') || {}
    if (!settings.subscriptions) {
      settings.subscriptions = {}
    }
    settings.subscriptions[templateId] = true
    uni.setStorageSync('student_planner_settings', settings)

    loadSubscriptions()

    uni.showToast({
      title: '订阅成功',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '订阅失败，请重试',
      icon: 'none'
    })
  }
}

/**
 * 取消单个订阅
 */
function unsubscribeSingle(type: 'course' | 'task' | 'goal'): void {
  let templateId = ''

  switch (type) {
    case 'course':
      templateId = TEMPLATE_IDS.COURSE_REMINDER
      break
    case 'task':
      templateId = TEMPLATE_IDS.TASK_REMINDER
      break
    case 'goal':
      templateId = TEMPLATE_IDS.GOAL_PROGRESS
      break
  }

  if (!templateId) return

  // 更新订阅状态
  const settings = uni.getStorageSync('student_planner_settings') || {}
  if (settings.subscriptions) {
    settings.subscriptions[templateId] = false
  }
  uni.setStorageSync('student_planner_settings', settings)

  loadSubscriptions()

  uni.showToast({
    title: '已取消订阅',
    icon: 'success'
  })
}

/**
 * 一键订阅全部
 */
async function subscribeAll(): Promise<void> {
  const templateIds = [
    TEMPLATE_IDS.COURSE_REMINDER,
    TEMPLATE_IDS.TASK_REMINDER,
    TEMPLATE_IDS.GOAL_PROGRESS
  ].filter(id => id !== '')

  if (templateIds.length === 0) {
    uni.showToast({
      title: '模板ID未配置',
      icon: 'none'
    })
    return
  }

  try {
    await requestSubscribeMessage(templateIds)

    // 更新订阅状态
    const settings = uni.getStorageSync('student_planner_settings') || {}
    if (!settings.subscriptions) {
      settings.subscriptions = {}
    }
    templateIds.forEach(id => {
      settings.subscriptions[id] = true
    })
    uni.setStorageSync('student_planner_settings', settings)

    loadSubscriptions()

    uni.showToast({
      title: '全部订阅成功',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '订阅失败，请重试',
      icon: 'none'
    })
  }
}

/**
 * 取消全部订阅
 */
function cancelAll(): void {
  const settings = uni.getStorageSync('student_planner_settings') || {}
  if (settings.subscriptions) {
    Object.keys(settings.subscriptions).forEach(key => {
      settings.subscriptions[key] = false
    })
  }
  uni.setStorageSync('student_planner_settings', settings)

  loadSubscriptions()

  uni.showToast({
    title: '已取消全部订阅',
    icon: 'success'
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  padding: 48rpx 32rpx 32rpx;
  background: #fff;
}

.title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.subtitle {
  display: block;
  font-size: 26rpx;
  color: #999;
}

.subscribe-list {
  margin: 24rpx 16rpx;
}

.subscribe-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.item-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-info {
  flex: 1;
}

.item-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 4rpx;
}

.item-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.info-section {
  margin: 24rpx 16rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.info-title {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.info-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}

.action-section {
  margin: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.btn {
  padding: 24rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: bold;
}

.btn.primary {
  background: #007AFF;
  color: #fff;
}

.btn.secondary {
  background: #fff;
  color: #666;
}

.status-section {
  margin: 24rpx 16rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 0;
  font-size: 26rpx;
  color: #666;
}

.status-item:first-child {
  padding-top: 0;
}

.status-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}
</style>
