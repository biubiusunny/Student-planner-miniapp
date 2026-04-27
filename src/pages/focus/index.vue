<template>
  <view class="container">
    <!-- 番茄钟界面 -->
    <view class="focus-section">
      <!-- 时间显示 -->
      <view class="timer-display">
        <text class="timer-text">{{ formatTime(remainingSeconds) }}</text>
        <text class="timer-label">{{ isWorking ? '专注中' : '休息中' }}</text>
      </view>

      <!-- 任务关联 -->
      <view v-if="currentTask" class="current-task">
        <text class="task-label">当前任务</text>
        <text class="task-title">{{ currentTask.title }}</text>
      </view>

      <!-- 控制按钮 -->
      <view class="controls">
        <view v-if="!isRunning" class="btn primary" @tap="startTimer">
          <text>开始</text>
        </view>
        <view v-else class="btn secondary" @tap="pauseTimer">
          <text>暂停</text>
        </view>
        <view class="btn outline" @tap="resetTimer">
          <text>重置</text>
        </view>
      </view>

      <!-- 时长选择 -->
      <view class="duration-selector">
        <text class="selector-label">专注时长</text>
        <view class="duration-options">
          <view
            v-for="option in durationOptions"
            :key="option.value"
            :class="['duration-option', { active: workDuration === option.value }]"
            @tap="setWorkDuration(option.value)"
          >
            <text>{{ option.label }}</text>
          </view>
        </view>
      </view>

      <!-- 白噪音选择 -->
      <view class="noise-selector">
        <text class="selector-label">白噪音</text>
        <view class="noise-options">
          <view
            v-for="noise in noiseConfigs"
            :key="noise.value"
            :class="['noise-option', { active: selectedNoise === noise.value }]"
            @tap="selectNoise(noise.value)"
          >
            <uni-icons :type="noise.icon" size="16" color="#fff" />
            <text>{{ noise.label }}</text>
          </view>
        </view>
      </view>

      <!-- 音量控制 -->
      <view v-if="selectedNoise !== 'silence'" class="volume-control">
        <uni-icons type="sound-filled" size="20" color="#fff" />
        <slider
          :value="volume"
          min="0"
          max="100"
          @change="onVolumeChange"
          activeColor="#fff"
          backgroundColor="rgba(255,255,255,0.3)"
          block-size="20"
          class="volume-slider"
        />
        <text class="volume-text">{{ volume }}%</text>
      </view>
    </view>

    <!-- 今日统计 -->
    <view class="stats-section">
      <view class="section-title">
        <text>今日专注</text>
      </view>
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-value">{{ todayFocusMinutes }}min</text>
          <text class="stat-label">专注时长</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ todaySessionsCount }}次</text>
          <text class="stat-label">专注次数</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ weekFocusMinutes }}min</text>
          <text class="stat-label">本周总时长</text>
        </view>
      </view>
    </view>

    <!-- 专注记录 -->
    <view class="history-section">
      <view class="section-title">
        <text>专注记录</text>
        <text class="more" @tap="goToHistory">查看全部</text>
      </view>
      <view class="history-list">
        <view
          v-for="session in recentSessions"
          :key="session.id"
          class="history-item"
        >
          <view class="history-time">
            <text class="time-text">{{ formatSessionTime(session.startTime) }}</text>
            <text class="noise-text">{{ getNoiseText(session.noiseType) }}</text>
          </view>
          <view class="history-duration">
            <text class="duration-text">{{ session.duration }}分钟</text>
            <uni-icons
              :type="session.completed ? 'checkmarkempty' : 'closeempty'"
              :color="session.completed ? '#34c759' : '#ff3b30'"
              size="18"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 任务选择 -->
    <view v-if="!isRunning" class="task-selector">
      <view class="section-title">
        <text>选择任务</text>
      </view>
      <scroll-view class="task-scroll" scroll-y>
        <view
          v-for="task in uncompletedTasks"
          :key="task.id"
          :class="['task-item', { active: currentTask?.id === task.id }]"
          @tap="selectTask(task)"
        >
          <text class="task-title">{{ task.title }}</text>
          <uni-icons
            v-if="currentTask?.id === task.id"
            type="checkmarkempty"
            color="#007AFF"
            size="20"
          />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import { focusStorage, taskStorage } from '@/utils/storage'
import { getNoisePlayer, destroyNoisePlayer } from '@/utils/audioPlayer'
import type { FocusSession, Task, NoiseType } from '@/types'

// ==================== 数据 ====================
const isRunning = ref(false)
const isWorking = ref(true)
const workDuration = ref(25) // 默认25分钟
const breakDuration = ref(5)
const remainingSeconds = ref(25 * 60)
const selectedNoise = ref<NoiseType>('silence')
const volume = ref(50)
const currentTask = ref<Task | null>(null)
const uncompletedTasks = ref<Task[]>([])
const recentSessions = ref<FocusSession[]>([])
const todayFocusMinutes = ref(0)
const todaySessionsCount = ref(0)
const weekFocusMinutes = ref(0)

let timer: number | null = null
const noisePlayer = getNoisePlayer()

const durationOptions = [
  { label: '25分钟', value: 25 },
  { label: '45分钟', value: 45 },
  { label: '60分钟', value: 60 }
]

const noiseConfigs = noisePlayer.constructor.getNoiseConfigs()

// ==================== 生命周期 ====================
onMounted(() => {
  loadData()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  destroyNoisePlayer()
})

// ==================== 方法 ====================

/**
 * 加载数据
 */
function loadData() {
  // 加载未完成任务
  uncompletedTasks.value = taskStorage.getUncompleted()

  // 加载今日统计数据
  const todaySessions = focusStorage.getTodaySessions()
  todayFocusMinutes.value = todaySessions.reduce((sum, s) => sum + s.duration, 0)
  todaySessionsCount.value = todaySessions.length

  // 加载本周统计数据
  const weekSessions = focusStorage.getWeekSessions()
  weekFocusMinutes.value = weekSessions.reduce((sum, s) => sum + s.duration, 0)

  // 加载最近记录
  recentSessions.value = todaySessions.slice(-5).reverse()
}

/**
 * 格式化时间显示
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * 开始计时
 */
function startTimer() {
  isRunning.value = true
  timer = setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) {
      completeSession()
    }
  }, 1000)
}

/**
 * 暂停计时
 */
function pauseTimer() {
  isRunning.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

/**
 * 重置计时
 */
function resetTimer() {
  pauseTimer()
  isWorking.value = true
  remainingSeconds.value = workDuration.value * 60
}

/**
 * 完成一次专注
 */
function completeSession() {
  pauseTimer()

  // 保存专注记录
  const session: FocusSession = {
    id: Date.now().toString(),
    taskId: currentTask.value?.id,
    duration: workDuration.value,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    noiseType: selectedNoise.value,
    completed: true,
    createTime: new Date().toISOString()
  }
  focusStorage.add(session)

  // 更新任务状态
  if (currentTask.value) {
    currentTask.value.isCompleted = true
    currentTask.value.completedTime = new Date().toISOString()
    taskStorage.update(currentTask.value)
  }

  // 播放提示音
  uni.vibrateShort()

  uni.showToast({
    title: '专注完成！',
    icon: 'success'
  })

  // 重置计时器
  resetTimer()
  loadData()
}

/**
 * 设置工作时长
 */
function setWorkDuration(minutes: number) {
  workDuration.value = minutes
  if (!isRunning.value) {
    remainingSeconds.value = minutes * 60
  }
}

/**
 * 选择白噪音
 */
function selectNoise(noise: NoiseType) {
  selectedNoise.value = noise
  noisePlayer.play(noise, volume.value)
}

/**
 * 音量变化
 */
function onVolumeChange(e: { detail: { value: number } }) {
  volume.value = e.detail.value
  noisePlayer.setVolume(volume.value)
}

/**
 * 获取噪音图标
 */
function getNoiseIcon(type: NoiseType): string {
  const configs = noisePlayer.constructor.getNoiseConfigs()
  const noise = configs.find(n => n.value === type)
  return noise?.icon || 'sound'
}

/**
 * 选择任务
 */
function selectTask(task: Task) {
  currentTask.value = task
}

/**
 * 格式化会话时间
 */
function formatSessionTime(startTime: string): string {
  return dayjs(startTime).format('HH:mm')
}

/**
 * 获取噪音文本
 */
function getNoiseText(type: NoiseType): string {
  const noise = noiseConfigs.find(n => n.value === type)
  return noise?.label || '静音'
}

/**
 * 查看历史记录
 */
function goToHistory() {
  uni.navigateTo({
    url: '/pages/focus/history'
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.focus-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 48rpx 32rpx 64rpx;
  color: #fff;
  border-radius: 0 0 48rpx 48rpx;
}

.timer-display {
  text-align: center;
  margin-bottom: 32rpx;
}

.timer-text {
  display: block;
  font-size: 120rpx;
  font-weight: bold;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  line-height: 1;
  margin-bottom: 16rpx;
}

.timer-label {
  font-size: 28rpx;
  opacity: 0.9;
}

.current-task {
  text-align: center;
  margin-bottom: 32rpx;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
}

.task-label {
  display: block;
  font-size: 24rpx;
  opacity: 0.9;
  margin-bottom: 8rpx;
}

.task-title {
  font-size: 30rpx;
  font-weight: bold;
}

.controls {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: bold;
}

.btn.primary {
  background: #fff;
  color: #667eea;
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
}

.btn.outline {
  background: transparent;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  color: #fff;
}

.duration-selector,
.noise-selector {
  margin-bottom: 24rpx;
}

.selector-label {
  display: block;
  font-size: 24rpx;
  opacity: 0.9;
  margin-bottom: 12rpx;
}

.duration-options,
.noise-options {
  display: flex;
  gap: 12rpx;
}

.duration-option,
.noise-option {
  flex: 1;
  padding: 12rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.duration-option.active,
.noise-option.active {
  background: #fff;
  color: #667eea;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 0;
}

.volume-slider {
  flex: 1;
}

.volume-text {
  font-size: 24rpx;
  min-width: 60rpx;
  text-align: right;
}

.stats-section {
  margin: 32rpx 16rpx 24rpx;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 0 8rpx;
}

.section-title text {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.more {
  font-size: 24rpx;
  color: #007AFF;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.stat-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx 16rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.stat-value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #007AFF;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.history-section {
  margin: 24rpx 16rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.history-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.history-time {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.time-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.noise-text {
  font-size: 24rpx;
  color: #999;
}

.history-duration {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.duration-text {
  font-size: 26rpx;
  color: #666;
}

.task-selector {
  margin: 24rpx 16rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.task-scroll {
  max-height: 400rpx;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
  background: #f5f5f5;
}

.task-item.active {
  background: #e8f4ff;
  border: 2rpx solid #007AFF;
}

.task-item .task-title {
  font-size: 28rpx;
  color: #333;
}

.task-item.active .task-title {
  color: #007AFF;
  font-weight: bold;
}
</style>
