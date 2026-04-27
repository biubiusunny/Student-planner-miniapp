<template>
  <view class="container">
    <view v-if="goal" class="content">
      <!-- 目标头部 -->
      <view class="goal-header">
        <view class="goal-icon" :style="{ background: getGoalColor(goal.type) }">
          <uni-icons type="flag" size="28" color="#fff" />
        </view>
        <view class="goal-info">
          <text class="goal-title">{{ goal.title }}</text>
          <text class="goal-type">{{ getGoalTypeText(goal.type) }}</text>
        </view>
      </view>

      <!-- 进度展示 -->
      <view class="section">
        <text class="section-title">目标进度</text>
        <view class="progress-section">
          <view class="progress-bar">
            <view
              class="progress-fill"
              :style="{ width: `${progressPercent}%`, background: getProgressColor(progressPercent) }"
            />
          </view>
          <text class="progress-text">{{ progressPercent }}%</text>
        </view>
        <view class="progress-stats">
          <view class="stat-item">
            <text class="stat-value">{{ goal.currentProgress }}</text>
            <text class="stat-label">已完成</text>
          </view>
          <view class="stat-divider" />
          <view class="stat-item">
            <text class="stat-value">{{ goal.totalProgress }}</text>
            <text class="stat-label">总目标</text>
          </view>
          <view class="stat-divider" />
          <view class="stat-item">
            <text class="stat-value">{{ goal.weight || 5 }}</text>
            <text class="stat-label">权重</text>
          </view>
        </view>
      </view>

      <!-- 里程碑 -->
      <view v-if="goal.milestones && goal.milestones.length > 0" class="section">
        <text class="section-title">里程碑 ({{ completedMilestones }}/{{ goal.milestones.length }})</text>
        <view class="milestones-list">
          <view
            v-for="(milestone, index) in goal.milestones"
            :key="milestone.id"
            :class="['milestone-item', { completed: milestone.isCompleted }]"
          >
            <view class="milestone-icon">
              <uni-icons
                :type="milestone.isCompleted ? 'checkbox-filled' : 'checkbox'"
                :color="milestone.isCompleted ? '#34c759' : '#ccc'"
                size="20"
              />
            </view>
            <view class="milestone-content">
              <text class="milestone-title">{{ milestone.title }}</text>
              <view class="milestone-meta">
                <text class="milestone-progress">{{ milestone.targetProgress }}%</text>
                <text v-if="milestone.deadline" class="milestone-deadline">{{ formatDeadline(milestone.deadline) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 进度记录历史 -->
      <view v-if="goal.progressHistory && goal.progressHistory.length > 1" class="section">
        <view class="section-header">
          <text class="section-title">进度记录</text>
          <text class="section-desc">最近 {{ Math.min(5, goal.progressHistory.length) }} 次更新</text>
        </view>
        <view class="history-list">
          <view
            v-for="(record, index) in goal.progressHistory.slice().reverse().slice(0, 5)"
            :key="record.id"
            class="history-item"
          >
            <view class="history-icon">
              <uni-icons :type="record.delta > 0 ? 'up' : 'right'" size="16" color="#007AFF" />
            </view>
            <view class="history-content">
              <text class="history-progress">{{ record.progress }}</text>
              <text class="history-note">{{ record.note || '更新' }}</text>
            </view>
            <text class="history-time">{{ formatHistoryTime(record.createTime) }}</text>
          </view>
        </view>
      </view>

      <!-- 关联任务 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">关联任务 ({{ completedTasksCount }}/{{ goal.tasks.length }})</text>
          <view class="add-btn" @tap="addTask">
            <uni-icons type="plus" size="18" color="#007AFF" />
            <text>添加</text>
          </view>
        </view>
        <view v-if="relatedTasks.length > 0" class="task-list">
          <view
            v-for="task in relatedTasks"
            :key="task.id"
            class="task-item"
            @tap="goToTask(task.id)"
          >
            <uni-icons
              :type="task.isCompleted ? 'checkmarkempty' : 'circle'"
              :color="task.isCompleted ? '#34c759' : '#999'"
              size="20"
            />
            <text :class="['task-title', { completed: task.isCompleted }]">
              {{ task.title }}
            </text>
          </view>
        </view>
        <view v-else class="empty">
          <text>暂无关联任务</text>
        </view>
      </view>

      <!-- 目标统计 -->
      <view class="section">
        <text class="section-title">统计信息</text>
        <view class="stats-grid">
          <view class="stat-card">
            <text class="stat-value">{{ daysRemaining }}</text>
            <text class="stat-label">剩余天数</text>
          </view>
          <view class="stat-card">
            <text class="stat-value">{{ weeklyProgress }}</text>
            <text class="stat-label">本周完成</text>
          </view>
          <view class="stat-card">
            <text class="stat-value">{{ goal.tasks.length }}</text>
            <text class="stat-label">总任务数</text>
          </view>
        </view>
      </view>

      <!-- 快速操作 -->
      <view class="section">
        <text class="section-title">快速操作</text>
        <view class="action-list">
          <view class="action-item" @tap="updateProgress">
            <uni-icons type="compose" size="24" color="#007AFF" />
            <text>更新进度</text>
          </view>
          <view class="action-item" @tap="viewTasks">
            <uni-icons type="list" size="24" color="#666" />
            <text>查看任务</text>
          </view>
          <view v-if="progressPercent >= 100" class="action-item" @tap="completeGoal">
            <uni-icons type="checkbox" size="24" color="#34C759" />
            <text>标记完成</text>
          </view>
        </view>
      </view>

      <!-- 创建/更新时间 -->
      <view class="section">
        <text class="section-title">时间信息</text>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">创建时间</text>
            <text class="info-value">{{ formatTime(goal.createTime) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">更新时间</text>
            <text class="info-value">{{ formatTime(goal.updateTime) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-btn secondary" @tap="editGoal">
        <uni-icons type="compose" size="20" />
        <text>编辑</text>
      </view>
      <view class="action-btn danger" @tap="deleteGoal">
        <uni-icons type="trash" size="20" />
        <text>删除</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { goalStorage, taskStorage } from '@/utils/storage'
import type { Goal, Task } from '@/types'

// ==================== 数据 ====================
const goalId = ref('')
const goal = ref<Goal | null>(null)
const allTasks = ref<Task[]>([])

// ==================== 计算属性 ====================
const progressPercent = computed(() => {
  if (!goal.value) return 0
  if (goal.value.totalProgress === 0) return 0
  return Math.round((goal.value.currentProgress / goal.value.totalProgress) * 100)
})

const completedMilestones = computed(() => {
  if (!goal.value || !goal.value.milestones) return 0
  return goal.value.milestones.filter(m => m.isCompleted).length
})

const relatedTasks = computed(() => {
  if (!goal.value) return []
  return allTasks.value.filter(task => goal.value!.tasks.includes(task.id))
    .sort((a, b) => {
      // 已完成的排后面
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1
      }
      return dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf()
    })
})

const completedTasksCount = computed(() => {
  return relatedTasks.value.filter(t => t.isCompleted).length
})

const daysRemaining = computed(() => {
  if (!goal.value || !goal.value.deadline) return '-'
  const deadline = dayjs(goal.value.deadline)
  const now = dayjs()
  const diff = deadline.diff(now, 'day')
  return diff > 0 ? diff : 0
})

const weeklyProgress = computed(() => {
  // 计算本周完成的任务数
  const weekAgo = dayjs().subtract(7, 'day')
  const completedThisWeek = relatedTasks.value.filter(task => {
    if (!task.isCompleted || !task.completedTime) return false
    return dayjs(task.completedTime).isAfter(weekAgo)
  }).length
  return completedThisWeek
})

// ==================== 生命周期 ====================
onLoad((options) => {
  if (options?.id) {
    goalId.value = options.id
    loadGoalData()
  }
})

// ==================== 方法 ====================

/**
 * 加载目标数据
 */
function loadGoalData() {
  goal.value = goalStorage.getById(goalId.value)
  allTasks.value = taskStorage.getAll()
}

/**
 * 获取目标类型文本
 */
function getGoalTypeText(type: string): string {
  const map: Record<string, string> = {
    semester: '学期目标',
    exam: '考试目标',
    habit: '习惯目标'
  }
  return map[type] || '其他'
}

/**
 * 获取目标颜色
 */
function getGoalColor(type: string): string {
  const map: Record<string, string> = {
    semester: '#007AFF',
    exam: '#FF9500',
    habit: '#34C759'
  }
  return map[type] || '#999'
}

/**
 * 格式化时间
 */
function formatTime(time: string): string {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

/**
 * 格式化截止时间
 */
function formatDeadline(deadline: string): string {
  const date = dayjs(deadline)
  const now = dayjs()
  const diff = date.diff(now, 'day')

  if (diff <= 0) return '已截止'
  if (diff === 1) return '明天'
  if (diff < 7) return `${diff}天后`
  return date.format('MM-DD')
}

/**
 * 格式化历史时间
 */
function formatHistoryTime(time: string): string {
  const now = dayjs()
  const timeDate = dayjs(time)
  const diff = now.diff(timeDate, 'hour')

  if (diff < 1) return '刚刚'
  if (diff < 24) return `${diff}小时前`
  if (diff < 48) return '昨天'
  return timeDate.format('MM-DD HH:mm')
}

/**
 * 获取进度颜色
 */
function getProgressColor(percent: number): string {
  if (percent >= 100) return 'linear-gradient(90deg, #34C759, #30D158)'
  if (percent >= 60) return 'linear-gradient(90deg, #007AFF, #5856D6)'
  if (percent >= 30) return 'linear-gradient(90deg, #FF9500, #FF6B00)'
  return 'linear-gradient(90deg, #FF3B30, #FF2D55)'
}

/**
 * 添加任务
 */
function addTask() {
  uni.navigateTo({
    url: `/pages/task/add?goalId=${goalId.value}`
  })
}

/**
 * 前往任务详情
 */
function goToTask(taskId: string) {
  uni.navigateTo({
    url: `/pages/task/detail?id=${taskId}`
  })
}

/**
 * 更新进度
 */
function updateProgress() {
  if (!goal.value) return

  // 根据关联任务自动计算进度
  const total = goal.value.tasks.length
  const completed = completedTasksCount.value

  if (total === 0) {
    uni.showToast({
      title: '请先添加任务',
      icon: 'none'
    })
    return
  }

  const progress = Math.round((completed / total) * 100)

  uni.showModal({
    title: '更新进度',
    content: `当前进度: ${progress}%\n确认更新？`,
    success: (res) => {
      if (res.confirm && goal.value) {
        goal.value.currentProgress = progress
        goal.value.updateTime = new Date().toISOString()
        goalStorage.update(goal.value)

        uni.showToast({
          title: '进度已更新',
          icon: 'success'
        })

        loadGoalData()
      }
    }
  })
}

/**
 * 查看任务
 */
function viewTasks() {
  if (relatedTasks.value.length === 0) {
    uni.showToast({
      title: '暂无任务',
      icon: 'none'
    })
    return
  }

  // 跳转到第一个任务
  uni.navigateTo({
    url: `/pages/task/detail?id=${relatedTasks.value[0].id}`
  })
}

/**
 * 标记目标完成
 */
function completeGoal() {
  uni.showModal({
    title: '恭喜完成',
    content: '确认目标已完成？',
    success: (res) => {
      if (res.confirm && goal.value) {
        goal.value.currentProgress = goal.value.totalProgress
        goal.value.updateTime = new Date().toISOString()
        goalStorage.update(goal.value)

        uni.vibrateShort({
          success: () => {
            setTimeout(() => {
              uni.vibrateShort()
            }, 100)
          }
        })

        uni.showToast({
          title: '目标已完成！',
          icon: 'success',
          duration: 2000
        })

        loadGoalData()
      }
    }
  })
}

/**
 * 编辑目标
 */
function editGoal() {
  uni.navigateTo({
    url: `/pages/goal/edit?id=${goalId.value}`
  })
}

/**
 * 删除目标
 */
function deleteGoal() {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个目标吗？',
    confirmColor: '#ff3b30',
    success: (res) => {
      if (res.confirm) {
        goalStorage.delete(goalId.value)

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

.goal-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
  background: #fff;
  margin-bottom: 16rpx;
}

.goal-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.goal-info {
  flex: 1;
}

.goal-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.goal-type {
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

.progress-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.progress-bar {
  flex: 1;
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #00C6FF);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #007AFF;
  min-width: 80rpx;
  text-align: right;
}

.progress-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #f0f0f0;
}

/* 里程碑 */
.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  transition: all 0.2s;
}

.milestone-item.completed {
  background: #f0fff4;
}

.milestone-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.milestone-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.milestone-title {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.milestone-item.completed .milestone-title {
  text-decoration: line-through;
  color: #999;
}

.milestone-meta {
  display: flex;
  gap: 16rpx;
}

.milestone-progress {
  font-size: 22rpx;
  color: #007AFF;
  font-weight: bold;
}

.milestone-deadline {
  font-size: 22rpx;
  color: #999;
}

/* 进度记录历史 */
.section-desc {
  font-size: 24rpx;
  color: #999;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #f0f8ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.history-progress {
  font-size: 26rpx;
  font-weight: bold;
  color: #007AFF;
}

.history-note {
  font-size: 22rpx;
  color: #999;
}

.history-time {
  font-size: 22rpx;
  color: #999;
  min-width: 80rpx;
  text-align: right;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
}

.task-title {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.task-title.completed {
  text-decoration: line-through;
  color: #999;
}

.empty {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.stat-card {
  padding: 24rpx 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  text-align: center;
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

.info-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 26rpx;
  color: #999;
}

.info-value {
  font-size: 28rpx;
  color: #333;
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
