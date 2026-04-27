<template>
  <view class="container">
    <!-- 顶部统计 -->
    <view class="stats-header">
      <view class="stat-item">
        <text class="stat-value">{{ totalGoals }}</text>
        <text class="stat-label">总目标</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ completedGoals }}</text>
        <text class="stat-label">已完成</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ averageProgress }}</text>
        <text class="stat-label">平均进度</text>
      </view>
    </view>

    <!-- 分类筛选 -->
    <view class="filter-bar">
      <view
        v-for="filter in filters"
        :key="filter.key"
        :class="['filter-item', { active: activeFilter === filter.key }]"
        @tap="selectFilter(filter.key)"
      >
        <text>{{ filter.label }}</text>
        <text class="filter-count">{{ filter.count }}</text>
      </view>
    </view>

    <!-- 目标列表 -->
    <view class="goal-list">
      <view
        v-for="goal in filteredGoals"
        :key="goal.id"
        class="goal-card"
        @tap="viewGoal(goal.id)"
      >
        <!-- 目标头部 -->
        <view class="goal-header">
          <view class="goal-type-badge" :style="{ background: getGoalColor(goal.type) }">
            <uni-icons type="flag" size="14" color="#fff" />
          </view>
          <text class="goal-title">{{ goal.title }}</text>
          <view v-if="goal.weight >= 8" class="weight-badge">
            <text>P{{ goal.weight }}</text>
          </view>
        </view>

        <!-- 进度条 -->
        <view class="progress-section">
          <view class="progress-bar">
            <view
              class="progress-fill"
              :style="{ width: `${progressPercent(goal)}%`, background: getProgressColor(goal) }"
            />
          </view>
          <text class="progress-text">{{ progressPercent(goal) }}%</text>
        </view>

        <!-- 里程碑 -->
        <view v-if="goal.milestones.length > 0" class="milestones-preview">
          <view
            v-for="(milestone, index) in goal.milestones.slice(0, 4)"
            :key="milestone.id"
            :class="['milestone-dot', { completed: milestone.isCompleted }]"
            :style="{ left: `${(milestone.targetProgress / goal.totalProgress) * 100}%` }"
          />
        </view>

        <!-- 统计信息 -->
        <view class="goal-stats">
          <view class="stat-item">
            <uni-icons type="list" size="14" color="#999" />
            <text class="stat-text">{{ completedTasks(goal) }}/{{ goal.tasks.length }} 任务</text>
          </view>
          <view v-if="goal.milestones.length > 0" class="stat-item">
            <uni-icons type="checkmarkempty" size="14" color="#999" />
            <text class="stat-text">{{ completedMilestones(goal) }}/{{ goal.milestones.length }} 里程碑</text>
          </view>
          <view v-if="goal.deadline" class="stat-item">
            <uni-icons type="calendar" size="14" color="#999" />
            <text class="stat-text">{{ formatDeadline(goal.deadline) }}</text>
          </view>
        </view>

        <!-- 快捷操作 -->
        <view class="quick-actions" @tap.stop>
          <view class="action-btn" @tap="quickUpdateProgress(goal)">
            <uni-icons type="up" size="16" color="#007AFF" />
            <text>+进度</text>
          </view>
          <view class="action-btn" @tap.stop="editGoal(goal.id)">
            <uni-icons type="compose" size="16" color="#666" />
            <text>编辑</text>
          </view>
          <view class="action-btn delete" @tap.stop="deleteGoal(goal.id)">
            <uni-icons type="trash" size="16" color="#ff3b30" />
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="filteredGoals.length === 0" class="empty">
      <uni-icons type="flag" size="64" color="#ccc" />
      <text class="empty-text">{{ getEmptyText() }}</text>
      <view v-if="activeFilter === 'all' && goals.length === 0" class="empty-actions">
        <view class="template-btn" @tap="createGoalFromTemplate('cet4')">
          <text>四六级</text>
        </view>
        <view class="template-btn" @tap="createGoalFromTemplate('kaoyan')">
          <text>考研</text>
        </view>
        <view class="template-btn custom" @tap="addCustomGoal">
          <uni-icons type="plus" size="20" color="#007AFF" />
          <text>自定义</text>
        </view>
      </view>
    </view>

    <!-- 添加按钮 -->
    <view class="fab" @tap="addCustomGoal">
      <uni-icons type="plus" size="24" color="#fff" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { goalStorage, taskStorage } from '@/utils/storage'
import type { Goal } from '@/types'

// ==================== 数据 ====================
const goals = ref<Goal[]>([])
const allTasks = ref<any[]>([])
const activeFilter = ref<'all' | 'semester' | 'exam' | 'habit' | 'completed'>('all')

// ==================== 计算属性 ====================
const totalGoals = computed(() => goals.value.length)
const completedGoals = computed(() => goals.value.filter(g => g.currentProgress >= g.totalProgress).length)
const averageProgress = computed(() => {
  if (goals.value.length === 0) return 0
  const totalProgress = goals.value.reduce((sum, g) => sum + (g.currentProgress / g.totalProgress * 100), 0)
  return Math.round(totalProgress / goals.value.length) + '%'
})

const filters = computed(() => [
  { key: 'all' as const, label: '全部', count: goals.value.length },
  { key: 'semester' as const, label: '学期', count: goals.value.filter(g => g.type === 'semester').length },
  { key: 'exam' as const, label: '考试', count: goals.value.filter(g => g.type === 'exam').length },
  { key: 'habit' as const, label: '习惯', count: goals.value.filter(g => g.type === 'habit').length },
  { key: 'completed' as const, label: '已完成', count: completedGoals.value }
])

const filteredGoals = computed(() => {
  switch (activeFilter.value) {
    case 'semester':
      return goals.value.filter(g => g.type === 'semester')
    case 'exam':
      return goals.value.filter(g => g.type === 'exam')
    case 'habit':
      return goals.value.filter(g => g.type === 'habit')
    case 'completed':
      return goals.value.filter(g => g.currentProgress >= g.totalProgress)
    default:
      return goals.value.sort((a, b) => (b.weight || 5) - (a.weight || 5))
  }
})

// ==================== 生命周期 ====================
onMounted(() => {
  loadData()
})

// ==================== 方法 ====================

/**
 * 加载数据
 */
function loadData() {
  goals.value = goalStorage.getAll()
  allTasks.value = taskStorage.getAll()
}

/**
 * 计算进度百分比
 */
function progressPercent(goal: Goal): number {
  if (goal.totalProgress === 0) return 0
  return Math.round((goal.currentProgress / goal.totalProgress) * 100)
}

/**
 * 获取目标类型文本
 */
function getGoalTypeText(type: string): string {
  const map: Record<string, string> = {
    semester: '学期',
    exam: '考试',
    habit: '习惯'
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
 * 获取进度颜色
 */
function getProgressColor(goal: Goal): string {
  const percent = progressPercent(goal)
  if (percent >= 100) return 'linear-gradient(90deg, #34C759, #30D158)'
  if (percent >= 60) return 'linear-gradient(90deg, #007AFF, #5856D6)'
  if (percent >= 30) return 'linear-gradient(90deg, #FF9500, #FF6B00)'
  return 'linear-gradient(90deg, #FF3B30, #FF2D55)'
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
 * 获取已完成任务数
 */
function completedTasks(goal: Goal): number {
  return goal.tasks.filter(taskId => {
    const task = allTasks.value.find(t => t.id === taskId)
    return task?.isCompleted || false
  }).length
}

/**
 * 获取已完成里程碑数
 */
function completedMilestones(goal: Goal): number {
  return goal.milestones.filter(m => m.isCompleted).length
}

/**
 * 获取空状态文本
 */
function getEmptyText(): string {
  const map: Record<string, string> = {
    all: '暂无目标',
    semester: '暂无学期目标',
    exam: '暂无考试目标',
    habit: '暂无习惯目标',
    completed: '暂无已完成目标'
  }
  return map[activeFilter.value] || '暂无目标'
}

/**
 * 选择筛选
 */
function selectFilter(filter: 'all' | 'semester' | 'exam' | 'habit' | 'completed') {
  activeFilter.value = filter
}

/**
 * 查看目标
 */
function viewGoal(goalId: string) {
  uni.navigateTo({
    url: `/pages/goal/detail?id=${goalId}`
  })
}

/**
 * 快速更新进度
 */
function quickUpdateProgress(goal: Goal) {
  if (goal.currentProgress >= goal.totalProgress) {
    uni.showToast({
      title: '目标已完成',
      icon: 'none'
    })
    return
  }

  const increment = Math.max(1, Math.round(goal.totalProgress * 0.1))
  const newProgress = Math.min(goal.currentProgress + increment, goal.totalProgress)
  const delta = newProgress - goal.currentProgress

  uni.showModal({
    title: '更新进度',
    content: `当前: ${goal.currentProgress}/${goal.totalProgress}\n更新: ${newProgress}/${goal.totalProgress}`,
    success: (res) => {
      if (res.confirm) {
        goal.currentProgress = newProgress
        goal.updateTime = new Date().toISOString()

        // 添加进度记录
        if (goal.progressHistory) {
          goal.progressHistory.push({
            id: generateId(),
            progress: newProgress,
            delta: delta,
            note: '快速更新',
            createTime: new Date().toISOString()
          })
        }

        goalStorage.update(goal)
        loadData()

        uni.showToast({
          title: '进度已更新',
          icon: 'success'
        })
      }
    }
  })
}

/**
 * 编辑目标
 */
function editGoal(goalId: string) {
  uni.navigateTo({
    url: `/pages/goal/edit?id=${goalId}`
  })
}

/**
 * 删除目标
 */
function deleteGoal(goalId: string) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个目标吗？',
    success: (res) => {
      if (res.confirm) {
        goalStorage.delete(goalId)
        loadData()
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
      }
    }
  })
}

/**
 * 从模板创建目标
 */
function createGoalFromTemplate(template: string) {
  uni.navigateTo({
    url: `/pages/goal/create?template=${template}`
  })
}

/**
 * 添加自定义目标
 */
function addCustomGoal() {
  uni.navigateTo({
    url: '/pages/goal/create'
  })
}

// 下拉刷新
function onPullDownRefresh() {
  loadData()
  uni.stopPullDownRefresh()
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

/* 顶部统计 */
.stats-header {
  display: flex;
  justify-content: space-around;
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  background: #fff;
  overflow-x: auto;
  white-space: nowrap;
}

.filter-item {
  flex-shrink: 0;
  padding: 10rpx 20rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6rpx;
  transition: all 0.2s;
}

.filter-item.active {
  background: #007AFF;
  color: #fff;
}

.filter-count {
  font-size: 22rpx;
  opacity: 0.8;
}

/* 目标列表 */
.goal-list {
  padding: 16rpx;
}

.goal-card {
  position: relative;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

.goal-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.goal-type-badge {
  width: 40rpx;
  height: 40rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.goal-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.weight-badge {
  padding: 4rpx 10rpx;
  background: linear-gradient(135deg, #FF9500, #FF6B00);
  color: #fff;
  border-radius: 6rpx;
  font-size: 20rpx;
  font-weight: bold;
}

/* 进度条 */
.progress-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.progress-bar {
  flex: 1;
  height: 14rpx;
  background: #f0f0f0;
  border-radius: 7rpx;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 7rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #007AFF;
  min-width: 80rpx;
  text-align: right;
}

/* 里程碑预览 */
.milestones-preview {
  position: relative;
  height: 8rpx;
  margin-bottom: 20rpx;
  padding: 0 24rpx;
}

.milestone-dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #e0e0e0;
  border: 3rpx solid #fff;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.milestone-dot.completed {
  background: #34c759;
}

/* 统计信息 */
.goal-stats {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.stat-text {
  font-size: 24rpx;
  color: #666;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  gap: 12rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 12rpx 0;
  border-radius: 8rpx;
  background: #f5f5f5;
  font-size: 24rpx;
  color: #666;
  transition: all 0.2s;
}

.action-btn:active {
  background: #e0e0e0;
}

.action-btn.delete {
  background: #fff5f5;
  color: #ff3b30;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  gap: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.empty-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
}

.template-btn {
  padding: 16rpx 24rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #666;
}

.template-btn.custom {
  background: #e6f2ff;
  color: #007AFF;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

/* 悬浮按钮 */
.fab {
  position: fixed;
  right: 32rpx;
  bottom: 32rpx;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.4);
  z-index: 100;
}
</style>
