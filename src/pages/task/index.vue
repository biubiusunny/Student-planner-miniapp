<template>
  <view class="container">
    <!-- 切换学习/生活任务 -->
    <view class="type-switch">
      <view
        :class="['switch-item', { active: taskType === 'study' }]"
        @tap="switchType('study')"
      >
        <text>学习任务</text>
      </view>
      <view
        :class="['switch-item', { active: taskType === 'life' }]"
        @tap="switchType('life')"
      >
        <text>生活任务</text>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ filteredTasks.length }}</text>
        <text class="stat-label">全部</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ completedTasks.length }}</text>
        <text class="stat-label">已完成</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ urgentTasks.length }}</text>
        <text class="stat-label">紧急</text>
      </view>
    </view>

    <!-- 任务列表 -->
    <view class="task-list">
      <view
        v-for="task in filteredTasks"
        :key="task.id"
        class="task-card"
        @tap="toggleTask(task.id)"
      >
        <view class="task-checkbox">
          <uni-icons
            :type="task.isCompleted ? 'checkmarkempty' : 'circle'"
            :color="task.isCompleted ? '#34c759' : '#999'"
            size="24"
          />
        </view>
        <view class="task-content">
          <view class="task-header">
            <text :class="['task-title', { completed: task.isCompleted }]">
              {{ task.title }}
            </text>
            <view :class="['priority', `priority-${task.priority}`]">
              {{ getPriorityText(task.priority) }}
            </view>
          </view>
          <view class="task-meta">
            <text class="task-deadline">
              <uni-icons type="calendar" size="14" />
              {{ formatDeadline(task.deadline) }}
            </text>
            <text v-if="task.courseId" class="task-course">
              <uni-icons type="book" size="14" />
              {{ getCourseName(task.courseId) }}
            </text>
          </view>
          <view v-if="task.subtasks.length > 0" class="subtasks">
            <view
              v-for="sub in task.subtasks"
              :key="sub.id"
              class="subtask"
            >
              <uni-icons
                :type="sub.isCompleted ? 'checkmarkempty' : 'circle'"
                size="14"
                :color="sub.isCompleted ? '#34c759' : '#999'"
              />
              <text :class="{ completed: sub.isCompleted }">{{ sub.title }}</text>
            </view>
          </view>
        </view>
        <view class="task-actions" @tap.stop>
          <view class="action-btn" @tap="editTask(task.id)">
            <uni-icons type="compose" size="20" color="#666" />
          </view>
          <view class="action-btn" @tap="deleteTask(task.id)">
            <uni-icons type="trash" size="20" color="#ff3b30" />
          </view>
        </view>
      </view>
    </view>

    <view v-if="filteredTasks.length === 0" class="empty">
      <text>暂无任务</text>
    </view>

    <!-- 添加任务按钮 -->
    <view class="fab" @tap="addTask">
      <uni-icons type="plus" size="24" color="#fff" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { taskStorage, courseStorage } from '@/utils/storage'
import type { Task } from '@/types'

// ==================== 数据 ====================
const taskType = ref<'study' | 'life'>('study')
const allTasks = ref<Task[]>([])

// ==================== 计算属性 ====================
const filteredTasks = computed(() =>
  allTasks.value.filter(t => t.type === taskType.value)
    .sort((a, b) => {
      // 未完成的优先
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1
      }
      // 按截止时间排序
      return dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf()
    })
)

const completedTasks = computed(() =>
  filteredTasks.value.filter(t => t.isCompleted)
)

const urgentTasks = computed(() =>
  filteredTasks.value.filter(t =>
    !t.isCompleted &&
    dayjs(t.deadline).diff(dayjs(), 'hour') < 24
  )
)

// ==================== 生命周期 ====================
onMounted(() => {
  loadTasks()
})

// ==================== 方法 ====================

/**
 * 加载任务列表
 */
function loadTasks() {
  allTasks.value = taskStorage.getAll()
}

/**
 * 切换任务类型
 */
function switchType(type: 'study' | 'life') {
  taskType.value = type
}

/**
 * 切换任务完成状态
 */
function toggleTask(taskId: string) {
  const task = allTasks.value.find(t => t.id === taskId)
  if (task) {
    task.isCompleted = !task.isCompleted
    task.completedTime = task.isCompleted ? new Date().toISOString() : undefined
    task.updateTime = new Date().toISOString()
    taskStorage.update(task)
    loadTasks()
  }
}

/**
 * 格式化截止时间
 */
function formatDeadline(deadline: string): string {
  const time = dayjs(deadline)
  const now = dayjs()
  const diffHours = time.diff(now, 'hour')

  if (diffHours <= 0) return '已过期'
  if (diffHours < 1) return '1小时内'
  if (diffHours < 24) return `${diffHours}小时后`
  return time.format('MM-DD HH:mm')
}

/**
 * 获取优先级文本
 */
function getPriorityText(priority: string): string {
  const map: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
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

// ==================== 页面跳转 ====================
function addTask() {
  uni.navigateTo({
    url: `/pages/task/add?type=${taskType.value}`
  })
}

function editTask(taskId: string) {
  uni.navigateTo({
    url: `/pages/task/edit?id=${taskId}`
  })
}

function deleteTask(taskId: string) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个任务吗？',
    success: (res) => {
      if (res.confirm) {
        taskStorage.delete(taskId)
        loadTasks()
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
      }
    }
  })
}

// 下拉刷新
function onPullDownRefresh() {
  loadTasks()
  uni.stopPullDownRefresh()
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20rpx;
}

.type-switch {
  display: flex;
  background: #fff;
  padding: 16rpx;
  gap: 16rpx;
}

.switch-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666;
  background: #f5f5f5;
}

.switch-item.active {
  background: #007AFF;
  color: #fff;
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 16rpx;
  background: #fff;
  margin: 16rpx 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #007AFF;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.task-list {
  padding: 16rpx;
}

.task-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  gap: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.task-checkbox {
  display: flex;
  align-items: flex-start;
  padding-top: 4rpx;
}

.task-content {
  flex: 1;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.task-title {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  line-height: 1.4;
}

.task-title.completed {
  text-decoration: line-through;
  color: #999;
}

.priority {
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 20rpx;
  color: #fff;
  white-space: nowrap;
}

.priority-high {
  background: #ff3b30;
}

.priority-medium {
  background: #ff9500;
}

.priority-low {
  background: #34c759;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.task-deadline,
.task-course {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 24rpx;
  color: #999;
}

.subtasks {
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid #f0f0f0;
}

.subtask {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 0;
  font-size: 26rpx;
  color: #666;
}

.subtask.completed {
  color: #999;
  text-decoration: line-through;
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding-left: 8rpx;
}

.action-btn {
  padding: 8rpx;
}

.empty {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: 32rpx;
  width: 96rpx;
  height: 96rpx;
  background: #007AFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
  z-index: 100;
}
</style>
