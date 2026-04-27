<template>
  <view class="container">
    <view v-if="task" class="content">
      <!-- 任务头部 -->
      <view class="task-header">
        <view class="task-icon">
          <uni-icons
            :type="task.isCompleted ? 'checkmarkempty' : 'circle'"
            :color="task.isCompleted ? '#34c759' : '#007AFF'"
            size="32"
            @tap="toggleComplete"
          />
        </view>
        <view class="task-info">
          <text :class="['task-title', { completed: task.isCompleted }]">{{ task.title }}</text>
          <text class="task-meta">{{ getTaskTypeText(task.type) }} • {{ getPriorityText(task.priority) }}</text>
        </view>
      </view>

      <!-- 任务信息卡片 -->
      <view class="section">
        <text class="section-title">任务信息</text>
        <view class="info-list">
          <view class="info-item">
            <uni-icons type="calendar" size="18" color="#999" />
            <text class="info-label">截止时间</text>
            <text :class="['info-value', { overdue: isOverdue }]">{{ formatDeadline(task.deadline) }}</text>
          </view>
          <view v-if="task.courseId" class="info-item">
            <uni-icons type="book" size="18" color="#999" />
            <text class="info-label">关联课程</text>
            <text class="info-value">{{ getCourseName(task.courseId) }}</text>
          </view>
          <view class="info-item">
            <uni-icons type="flag" size="18" color="#999" />
            <text class="info-label">创建时间</text>
            <text class="info-value">{{ formatCreateTime(task.createTime) }}</text>
          </view>
          <view v-if="task.completedTime" class="info-item">
            <uni-icons type="checkbox" size="18" color="#999" />
            <text class="info-label">完成时间</text>
            <text class="info-value">{{ formatCreateTime(task.completedTime) }}</text>
          </view>
        </view>
      </view>

      <!-- 子任务 -->
      <view v-if="task.subtasks.length > 0" class="section">
        <view class="section-header">
          <text class="section-title">子任务 ({{ completedSubtasks }}/{{ task.subtasks.length }})</text>
          <view class="add-btn" @tap="addSubtask">
            <uni-icons type="plus" size="18" color="#007AFF" />
            <text>添加</text>
          </view>
        </view>
        <view class="subtask-list">
          <view
            v-for="subtask in task.subtasks"
            :key="subtask.id"
            class="subtask-item"
          >
            <uni-icons
              :type="subtask.isCompleted ? 'checkmarkempty' : 'circle'"
              :color="subtask.isCompleted ? '#34c759' : '#999'"
              size="20"
              @tap="toggleSubtask(subtask.id)"
            />
            <text :class="['subtask-title', { completed: subtask.isCompleted }]">
              {{ subtask.title }}
            </text>
            <uni-icons
              type="close"
              size="16"
              color="#999"
              @tap="deleteSubtask(subtask.id)"
            />
          </view>
        </view>
      </view>

      <!-- 倒计时 -->
      <view class="section">
        <text class="section-title">倒计时</text>
        <view class="countdown">
          <view class="countdown-item">
            <text class="countdown-value">{{ countdown.days }}</text>
            <text class="countdown-label">天</text>
          </view>
          <view class="countdown-item">
            <text class="countdown-value">{{ countdown.hours }}</text>
            <text class="countdown-label">时</text>
          </view>
          <view class="countdown-item">
            <text class="countdown-value">{{ countdown.minutes }}</text>
            <text class="countdown-label">分</text>
          </view>
        </view>
      </view>

      <!-- 任务操作 -->
      <view class="section">
        <text class="section-title">快速操作</text>
        <view class="action-list">
          <view class="action-item" @tap="startFocus">
            <uni-icons type="clock" size="24" color="#007AFF" />
            <text>开始专注</text>
          </view>
          <view class="action-item" @tap="duplicateTask">
            <uni-icons type="copy" size="24" color="#666" />
            <text>复制任务</text>
          </view>
          <view v-if="task.isCompleted" class="action-item" @tap="uncompleteTask">
            <uni-icons type="refresh" size="24" color="#FF9500" />
            <text>标记未完成</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-btn secondary" @tap="editTask">
        <uni-icons type="compose" size="20" />
        <text>编辑</text>
      </view>
      <view class="action-btn danger" @tap="deleteTask">
        <uni-icons type="trash" size="20" />
        <text>删除</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { taskStorage, courseStorage } from '@/utils/storage'
import type { Task } from '@/types'
import { generateId } from '@/utils'

// ==================== 数据 ====================
const taskId = ref('')
const task = ref<Task | null>(null)
let countdownTimer: number | null = null

const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0
})

// ==================== 计算属性 ====================
const isOverdue = computed(() => {
  if (!task.value) return false
  if (task.value.isCompleted) return false
  return dayjs(task.value.deadline).isBefore(dayjs())
})

const completedSubtasks = computed(() => {
  if (!task.value) return 0
  return task.value.subtasks.filter(s => s.isCompleted).length
})

// ==================== 生命周期 ====================
onLoad((options) => {
  if (options?.id) {
    taskId.value = options.id
    loadTaskData()
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

// ==================== 方法 ====================

/**
 * 加载任务数据
 */
function loadTaskData() {
  task.value = taskStorage.getById(taskId.value)
  if (task.value) {
    startCountdown()
  }
}

/**
 * 开始倒计时
 */
function startCountdown() {
  updateCountdown()
  countdownTimer = setInterval(() => {
    updateCountdown()
  }, 60000) // 每分钟更新
}

/**
 * 更新倒计时
 */
function updateCountdown() {
  if (!task.value) return

  const deadline = dayjs(task.value.deadline)
  const now = dayjs()

  if (task.value.isCompleted) {
    countdown.value = { days: 0, hours: 0, minutes: 0 }
    return
  }

  const diff = deadline.diff(now)

  if (diff <= 0) {
    countdown.value = { days: 0, hours: 0, minutes: 0 }
    return
  }

  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))

  countdown.value = { days, hours, minutes }
}

/**
 * 切换完成状态
 */
function toggleComplete() {
  if (!task.value) return

  task.value.isCompleted = !task.value.isCompleted
  task.value.completedTime = task.value.isCompleted ? new Date().toISOString() : undefined
  task.value.updateTime = new Date().toISOString()
  taskStorage.update(task.value)

  if (task.value.isCompleted) {
    uni.vibrateShort()
  }

  loadTaskData()
}

/**
 * 切换子任务状态
 */
function toggleSubtask(subtaskId: string) {
  if (!task.value) return

  const subtask = task.value.subtasks.find(s => s.id === subtaskId)
  if (subtask) {
    subtask.isCompleted = !subtask.isCompleted

    // 检查是否所有子任务都完成了
    const allCompleted = task.value.subtasks.every(s => s.isCompleted)
    if (allCompleted && !task.value.isCompleted) {
      task.value.isCompleted = true
      task.value.completedTime = new Date().toISOString()
    }

    task.value.updateTime = new Date().toISOString()
    taskStorage.update(task.value)
  }
}

/**
 * 添加子任务
 */
function addSubtask() {
  uni.showModal({
    title: '添加子任务',
    editable: true,
    placeholderText: '请输入子任务内容',
    success: (res) => {
      if (res.confirm && res.content && task.value) {
        task.value.subtasks.push({
          id: generateId(),
          title: res.content,
          isCompleted: false
        })
        task.value.updateTime = new Date().toISOString()
        taskStorage.update(task.value)
        loadTaskData()
      }
    }
  })
}

/**
 * 删除子任务
 */
function deleteSubtask(subtaskId: string) {
  if (!task.value) return

  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个子任务吗？',
    success: (res) => {
      if (res.confirm) {
        task.value.subtasks = task.value.subtasks.filter(s => s.id !== subtaskId)
        task.value.updateTime = new Date().toISOString()
        taskStorage.update(task.value)
        loadTaskData()
      }
    }
  })
}

/**
 * 获取任务类型文本
 */
function getTaskTypeText(type: string): string {
  const map: Record<string, string> = {
    study: '学习',
    life: '生活'
  }
  return map[type] || '其他'
}

/**
 * 获取优先级文本
 */
function getPriorityText(priority: string): string {
  const map: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return map[priority] || '无'
}

/**
 * 获取课程名称
 */
function getCourseName(courseId: string): string {
  const course = courseStorage.getById(courseId)
  return course?.name || ''
}

/**
 * 格式化截止时间
 */
function formatDeadline(deadline: string): string {
  return dayjs(deadline).format('YYYY-MM-DD HH:mm')
}

/**
 * 格式化创建时间
 */
function formatCreateTime(time: string): string {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

/**
 * 开始专注
 */
function startFocus() {
  uni.switchTab({
    url: '/pages/focus/index'
  })
}

/**
 * 复制任务
 */
function duplicateTask() {
  if (!task.value) return

  const newTask: Task = {
    ...JSON.parse(JSON.stringify(task.value)),
    id: generateId(),
    isCompleted: false,
    completedTime: undefined,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  }

  taskStorage.add(newTask)

  uni.showToast({
    title: '复制成功',
    icon: 'success'
  })
}

/**
 * 标记未完成
 */
function uncompleteTask() {
  if (!task.value) return

  task.value.isCompleted = false
  task.value.completedTime = undefined
  task.value.updateTime = new Date().toISOString()
  taskStorage.update(task.value)

  loadTaskData()
}

/**
 * 编辑任务
 */
function editTask() {
  uni.navigateTo({
    url: `/pages/task/edit?id=${taskId.value}`
  })
}

/**
 * 删除任务
 */
function deleteTask() {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个任务吗？',
    confirmColor: '#ff3b30',
    success: (res) => {
      if (res.confirm) {
        taskStorage.delete(taskId.value)

        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.content {
  padding: 24rpx 0;
}

.task-header {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  padding: 32rpx;
  background: #fff;
  margin-bottom: 16rpx;
}

.task-icon {
  padding-top: 4rpx;
}

.task-info {
  flex: 1;
}

.task-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
  line-height: 1.4;
}

.task-title.completed {
  text-decoration: line-through;
  color: #999;
}

.task-meta {
  display: block;
  font-size: 26rpx;
  color: #999;
}

.section {
  margin: 16rpx 16rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  background: #f5f5f5;
  border-radius: 6rpx;
  font-size: 24rpx;
  color: #007AFF;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.info-label {
  font-size: 26rpx;
  color: #999;
  min-width: 120rpx;
}

.info-value {
  font-size: 28rpx;
  color: #333;
}

.info-value.overdue {
  color: #ff3b30;
}

.subtask-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
}

.subtask-title {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.subtask-title.completed {
  text-decoration: line-through;
  color: #999;
}

.countdown {
  display: flex;
  justify-content: space-around;
  padding: 32rpx 0;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.countdown-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #007AFF;
  margin-bottom: 8rpx;
}

.countdown-label {
  font-size: 24rpx;
  color: #999;
}

.action-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 16rpx;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.action-btn.secondary {
  background: #f5f5f5;
  color: #333;
}

.action-btn.danger {
  background: #fff5f5;
  color: #ff3b30;
}
</style>
