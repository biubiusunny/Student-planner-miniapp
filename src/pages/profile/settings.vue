<template>
  <view class="container">
    <!-- 提醒设置 -->
    <view class="section">
      <text class="section-title">提醒设置</text>
      <view class="setting-item">
        <view class="item-left">
          <text class="item-label">课程提醒时间</text>
        </view>
        <view class="item-right">
          <picker
            mode="selector"
            :range="courseReminderOptions"
            @change="onCourseReminderChange"
          >
            <view class="picker-value">
              <text>{{ courseReminderText }}</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
        </view>
      </view>
      <view class="setting-item">
        <view class="item-left">
          <text class="item-label">任务提醒时间</text>
        </view>
        <view class="item-right">
          <picker
            mode="selector"
            :range="taskReminderOptions"
            @change="onTaskReminderChange"
          >
            <view class="picker-value">
              <text>{{ taskReminderText }}</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 番茄钟设置 -->
    <view class="section">
      <text class="section-title">番茄钟设置</text>
      <view class="setting-item">
        <view class="item-left">
          <text class="item-label">专注时长</text>
        </view>
        <view class="item-right">
          <picker
            mode="selector"
            :range="focusDurationOptions"
            @change="onFocusDurationChange"
          >
            <view class="picker-value">
              <text>{{ focusDurationText }}</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
        </view>
      </view>
      <view class="setting-item">
        <view class="item-left">
          <text class="item-label">休息时长</text>
        </view>
        <view class="item-right">
          <picker
            mode="selector"
            :range="breakDurationOptions"
            @change="onBreakDurationChange"
          >
            <view class="picker-value">
              <text>{{ breakDurationText }}</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 通用设置 -->
    <view class="section">
      <text class="section-title">通用设置</text>
      <view class="setting-item">
        <view class="item-left">
          <text class="item-label">主题模式</text>
        </view>
        <view class="item-right">
          <picker
            mode="selector"
            :range="themeModeOptions"
            @change="onThemeModeChange"
          >
            <view class="picker-value">
              <text>{{ themeModeText }}</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
        </view>
      </view>
      <view class="setting-item">
        <view class="item-left">
          <text class="item-label">当前学期</text>
        </view>
        <view class="item-right">
          <picker
            mode="selector"
            :range="semesterOptions"
            @change="onSemesterChange"
          >
            <view class="picker-value">
              <text>{{ currentSemester }}</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 通知设置 -->
    <view class="section">
      <text class="section-title">通知设置</text>
      <view class="setting-item">
        <view class="item-left">
          <text class="item-label">启用通知</text>
          <text class="item-desc">开启后可接收课程和任务提醒</text>
        </view>
        <view class="item-right">
          <switch
            :checked="settings.enableNotification"
            color="#007AFF"
            @change="onNotificationChange"
          />
        </view>
      </view>
      <view class="setting-item">
        <view class="item-left">
          <text class="item-label">震动提醒</text>
          <text class="item-desc">收到提醒时震动</text>
        </view>
        <view class="item-right">
          <switch
            :checked="settings.enableVibration"
            color="#007AFF"
            @change="onVibrationChange"
          />
        </view>
      </view>
      <view class="setting-item clickable" @tap="goToSubscribe">
        <view class="item-left">
          <text class="item-label">订阅消息管理</text>
          <text class="item-desc">管理微信订阅消息模板</text>
        </view>
        <view class="item-right">
          <uni-icons type="right" size="20" color="#ccc" />
        </view>
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="section">
      <text class="section-title">数据管理</text>
      <view class="setting-item clickable" @tap="exportData">
        <view class="item-left">
          <text class="item-label">导出数据</text>
          <text class="item-desc">备份所有数据到本地</text>
        </view>
        <view class="item-right">
          <uni-icons type="right" size="20" color="#ccc" />
        </view>
      </view>
      <view class="setting-item clickable" @tap="importData">
        <view class="item-left">
          <text class="item-label">导入数据</text>
          <text class="item-desc">从备份文件恢复数据</text>
        </view>
        <view class="item-right">
          <uni-icons type="right" size="20" color="#ccc" />
        </view>
      </view>
      <view class="setting-item clickable" @tap="goToLogs">
        <view class="item-left">
          <text class="item-label">日志监控</text>
          <text class="item-desc">查看应用运行日志</text>
        </view>
        <view class="item-right">
          <uni-icons type="right" size="20" color="#ccc" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { settingsStorage } from '@/utils/storage'
import type { AppSettings } from '@/types'

// ==================== 数据 ====================
const settings = ref<AppSettings>(settingsStorage.get())

// 选项数据
const courseReminderOptions = ['5分钟', '10分钟', '15分钟', '20分钟', '30分钟']
const taskReminderOptions = ['15分钟', '30分钟', '1小时', '2小时', '3小时']
const focusDurationOptions = ['15分钟', '25分钟', '45分钟', '60分钟', '90分钟']
const breakDurationOptions = ['5分钟', '10分钟', '15分钟', '20分钟']
const themeModeOptions = ['浅色模式', '深色模式', '自动跟随系统']
const semesterOptions = [
  '2023-2024-1',
  '2023-2024-2',
  '2024-2025-1',
  '2024-2025-2',
  '2025-2026-1',
  '2025-2026-2'
]

// ==================== 计算属性 ====================
const courseReminderText = computed(() => {
  const minutes = settings.value.reminder.course
  return `${minutes}分钟`
})

const taskReminderText = computed(() => {
  const minutes = settings.value.reminder.task
  if (minutes < 60) return `${minutes}分钟`
  return `${minutes / 60}小时`
})

const focusDurationText = computed(() => {
  return `${settings.value.pomodoro.workDuration}分钟`
})

const breakDurationText = computed(() => {
  return `${settings.value.pomodoro.breakDuration}分钟`
})

const themeModeText = computed(() => {
  const mode = settings.value.themeMode
  const map = {
    light: '浅色模式',
    dark: '深色模式',
    auto: '自动跟随系统'
  }
  return map[mode] || '自动跟随系统'
})

const currentSemester = computed(() => settings.value.currentSemester)

// ==================== 生命周期 ====================
onMounted(() => {
  loadSettings()
})

// ==================== 方法 ====================

/**
 * 加载设置
 */
function loadSettings() {
  settings.value = settingsStorage.get()
}

/**
 * 保存设置
 */
function saveSettings() {
  settingsStorage.set(settings.value)
  uni.showToast({
    title: '设置已保存',
    icon: 'success'
  })
}

/**
 * 课程提醒时间变更
 */
function onCourseReminderChange(e: { detail: { value: number } }) {
  const map = [5, 10, 15, 20, 30]
  settings.value.reminder.course = map[e.detail.value]
  saveSettings()
}

/**
 * 任务提醒时间变更
 */
function onTaskReminderChange(e: { detail: { value: number } }) {
  const map = [15, 30, 60, 120, 180]
  settings.value.reminder.task = map[e.detail.value]
  saveSettings()
}

/**
 * 专注时长变更
 */
function onFocusDurationChange(e: { detail: { value: number } }) {
  const map = [15, 25, 45, 60, 90]
  settings.value.pomodoro.workDuration = map[e.detail.value]
  saveSettings()
}

/**
 * 休息时长变更
 */
function onBreakDurationChange(e: { detail: { value: number } }) {
  const map = [5, 10, 15, 20]
  settings.value.pomodoro.breakDuration = map[e.detail.value]
  saveSettings()
}

/**
 * 主题模式变更
 */
function onThemeModeChange(e: { detail: { value: number } }) {
  const map: AppSettings['themeMode'][] = ['light', 'dark', 'auto']
  settings.value.themeMode = map[e.detail.value]
  saveSettings()

  // 应用主题
  applyTheme(settings.value.themeMode)
}

/**
 * 学期变更
 */
function onSemesterChange(e: { detail: { value: number } }) {
  settings.value.currentSemester = semesterOptions[e.detail.value]
  saveSettings()
}

/**
 * 通知开关变更
 */
function onNotificationChange(e: { detail: { value: boolean } }) {
  settings.value.enableNotification = e.detail.value
  saveSettings()
}

/**
 * 震动开关变更
 */
function onVibrationChange(e: { detail: { value: boolean } }) {
  settings.value.enableVibration = e.detail.value
  saveSettings()
}

/**
 * 应用主题
 */
function applyTheme(mode: AppSettings['themeMode']) {
  if (mode === 'auto') {
    const isDark = uni.getSystemInfoSync().theme === 'dark'
    applyThemeByMode(isDark ? 'dark' : 'light')
  } else {
    applyThemeByMode(mode)
  }
}

/**
 * 根据模式应用主题
 */
function applyThemeByMode(mode: 'light' | 'dark') {
  if (mode === 'dark') {
    uni.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#1a1a1a'
    })
  } else {
    uni.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#ffffff'
    })
  }
}

/**
 * 导出数据
 */
function exportData() {
  uni.navigateTo({
    url: '/pages/profile/export'
  })
}

/**
 * 导入数据
 */
function importData() {
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['json'],
    success: (res) => {
      const filePath = res.tempFiles[0].path
      uni.navigateTo({
        url: `/pages/profile/import?filePath=${filePath}`
      })
    }
  })
}

/**
 * 前往订阅消息管理
 */
function goToSubscribe() {
  uni.navigateTo({
    url: '/pages/profile/subscribe'
  })
}

/**
 * 前往日志监控
 */
function goToLogs() {
  uni.navigateTo({
    url: '/pages/profile/logs'
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.section {
  margin: 24rpx 16rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-item.clickable {
  padding: 24rpx 0;
}

.item-left {
  flex: 1;
}

.item-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 4rpx;
}

.item-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.picker-value {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #666;
}
</style>
