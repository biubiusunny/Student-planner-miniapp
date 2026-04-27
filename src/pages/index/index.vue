<template>
  <view class="container">
    <!-- 今日概览 -->
    <view class="card">
      <view class="header">
        <text class="date">{{ currentDate }}</text>
        <text class="week">{{ currentWeek }}</text>
      </view>
      <view class="stats">
        <view class="stat-item">
          <text class="stat-value">{{ todayTasks.length }}</text>
          <text class="stat-label">今日任务</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ completedTasks.length }}</text>
          <text class="stat-label">已完成</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ todayFocusMinutes }}min</text>
          <text class="stat-label">专注时长</text>
        </view>
      </view>
    </view>

    <!-- 今日课程 -->
    <view class="card">
      <view class="section-header">
        <text class="section-title">今日课程</text>
        <text class="section-more" @tap="goToCourse">查看全部</text>
      </view>
      <view v-if="todayCourses.length > 0" class="course-list">
        <view
          v-for="course in todayCourses"
          :key="course.id"
          class="course-item"
          @tap="goToCourseDetail(course.id)"
        >
          <view class="course-time">
            <text>{{ course.startSection }}-{{ course.endSection }}节</text>
          </view>
          <view class="course-info">
            <text class="course-name">{{ course.name }}</text>
            <text class="course-location">{{ course.classroom }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty">
        <text>今日无课程</text>
      </view>
    </view>

    <!-- 今日待办 -->
    <view class="card">
      <view class="section-header">
        <text class="section-title">今日待办</text>
        <view class="header-actions">
          <text class="task-count">{{ completedTasks.length }}/{{ todayTasks.length }}</text>
          <text class="section-more" @tap="goToTask">查看全部</text>
        </view>
      </view>

      <!-- 任务进度条 -->
      <view v-if="todayTasks.length > 0" class="progress-bar">
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <text class="progress-text">{{ progressPercent }}% 完成</text>
      </view>

      <!-- 任务分类 -->
      <view v-if="todayTasks.length > 0" class="task-categories">
        <view
          v-for="category in taskCategories"
          :key="category.key"
          :class="['category-item', { active: activeCategory === category.key }]"
          @tap="filterCategory(category.key)"
        >
          <text>{{ category.label }}</text>
          <text class="category-count">({{ category.count }})</text>
        </view>
      </view>

      <!-- 任务列表 -->
      <view v-if="filteredTasks.length > 0" class="task-list">
        <view
          v-for="task in filteredTasks"
          :key="task.id"
          :class="['task-item', { completed: task.isCompleted }]"
          @tap="toggleTaskComplete(task.id)"
        >
          <view class="task-checkbox">
            <uni-icons
              :type="task.isCompleted ? 'checkbox-filled' : 'checkbox'"
              :color="task.isCompleted ? '#34c759' : '#ccc'"
              size="24"
            />
          </view>
          <view class="task-content">
            <view class="task-header">
              <text :class="['task-title', { completed: task.isCompleted }]">
                {{ task.title }}
              </text>
              <view :class="['priority-badge', `priority-${task.priority}`]">
                <text>{{ getPriorityText(task.priority) }}</text>
              </view>
            </view>
            <view class="task-meta">
              <view class="meta-item">
                <uni-icons type="calendar" size="14" color="#999" />
                <text class="meta-text">{{ formatDeadline(task.deadline) }}</text>
              </view>
              <view v-if="task.courseId" class="meta-item">
                <uni-icons type="calendar" size="14" color="#999" />
                <text class="meta-text">{{ getCourseName(task.courseId) }}</text>
              </view>
              <view v-if="task.subtasks.length > 0" class="meta-item">
                <uni-icons type="list" size="14" color="#999" />
                <text class="meta-text">{{ getSubtaskProgress(task) }}</text>
              </view>
            </view>
            <!-- 子任务预览 -->
            <view v-if="task.subtasks.length > 0" class="subtasks-preview">
              <view
                v-for="(subtask, index) in task.subtasks.slice(0, 3)"
                :key="subtask.id"
                :class="['subtask-item', { completed: subtask.isCompleted }]"
              >
                <uni-icons
                  :type="subtask.isCompleted ? 'checkbox-filled' : 'checkbox'"
                  size="14"
                  :color="subtask.isCompleted ? '#34c759' : '#ccc'"
                />
                <text class="subtask-text">{{ subtask.title }}</text>
              </view>
              <text v-if="task.subtasks.length > 3" class="subtask-more">
                +{{ task.subtasks.length - 3 }} 个子任务
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <uni-icons type="checkbox" size="48" color="#ccc" />
        <text class="empty-text">{{ getEmptyText() }}</text>
        <view v-if="activeCategory === 'all' && todayTasks.length === 0" class="empty-action">
          <text class="action-btn" @tap.stop="goToAddTask">添加任务</text>
        </view>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="card">
      <view class="section-header">
        <text class="section-title">快捷入口</text>
      </view>
      <view class="quick-actions">
        <view class="action-item" @tap="goToAddTask">
          <uni-icons type="plus" size="24" color="#007AFF" />
          <text>添加任务</text>
        </view>
        <view class="action-item" @tap="goToAddCourse">
          <uni-icons type="calendar" size="24" color="#007AFF" />
          <text>添加课程</text>
        </view>
        <view class="action-item" @tap="startFocus">
          <uni-icons type="clock" size="24" color="#007AFF" />
          <text>开始专注</text>
        </view>
        <view class="action-item" @tap="goToGPA">
          <uni-icons type="compose" size="24" color="#007AFF" />
          <text>GPA计算</text>
        </view>
        <view class="action-item" @tap="goToCalendar">
          <uni-icons type="list" size="24" color="#007AFF" />
          <text>查看日历</text>
        </view>
        <view class="action-item" @tap="goToProfile">
          <uni-icons type="person" size="24" color="#007AFF" />
          <text>个人中心</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { taskStorage, focusStorage, courseStorage } from '@/utils/storage'
import type { Task, Course } from '@/types'

// ==================== 数据 ====================
const currentDate = ref('')
const currentWeek = ref('')
const todayCourses = ref<Course[]>([])
const todayTasks = ref<Task[]>([])
const todayFocusMinutes = ref(0)
const activeCategory = ref<'all' | 'study' | 'life' | 'high' | 'uncompleted'>('all')

// ==================== 计算属性 ====================
const completedTasks = computed(() =>
  todayTasks.value.filter(t => t.isCompleted)
)

const progressPercent = computed(() => {
  if (todayTasks.value.length === 0) return 0
  return Math.round((completedTasks.value.length / todayTasks.value.length) * 100)
})

const taskCategories = computed(() => {
  const all = todayTasks.value.length
  const study = todayTasks.value.filter(t => t.type === 'study').length
  const life = todayTasks.value.filter(t => t.type === 'life').length
  const high = todayTasks.value.filter(t => t.priority === 'high' && !t.isCompleted).length
  const uncompleted = todayTasks.value.filter(t => !t.isCompleted).length

  return [
    { key: 'all' as const, label: '全部', count: all },
    { key: 'study' as const, label: '学习', count: study },
    { key: 'life' as const, label: '生活', count: life },
    { key: 'high' as const, label: '高优', count: high },
    { key: 'uncompleted' as const, label: '未完成', count: uncompleted }
  ]
})

const filteredTasks = computed(() => {
  switch (activeCategory.value) {
    case 'study':
      return todayTasks.value.filter(t => t.type === 'study')
    case 'life':
      return todayTasks.value.filter(t => t.type === 'life')
    case 'high':
      return todayTasks.value.filter(t => t.priority === 'high')
    case 'uncompleted':
      return todayTasks.value.filter(t => !t.isCompleted)
    default:
      return todayTasks.value
  }
})

// ==================== 生命周期 ====================
onMounted(() => {
  initData()
})

// ==================== 方法 ====================

/**
 * 初始化数据
 */
function initData() {
  // 设置日期
  const now = new Date()
  currentDate.value = dayjs(now).format('YYYY年MM月DD日')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  currentWeek.value = weekDays[now.getDay()]

  // 加载今日课程
  loadTodayCourses()

  // 加载今日任务
  loadTodayTasks()

  // 加载今日专注时长
  loadTodayFocusMinutes()
}

/**
 * 加载今日课程
 */
function loadTodayCourses() {
  const allCourses = courseStorage.getAll()
  const settings = uni.getStorageSync('student_planner_settings')
  const currentSemester = settings?.currentSemester || '2024-2025-2'
  const dayOfWeek = new Date().getDay() || 7 // 周日为7

  todayCourses.value = allCourses.filter(course => {
    if (course.semester !== currentSemester) return false
    if (course.dayOfWeek !== dayOfWeek) return false

    // 检查单双周
    if (course.weekType === 'odd' || course.weekType === 'even') {
      const weekNumber = getWeekNumber()
      const isOddWeek = weekNumber % 2 === 1
      if (course.weekType === 'odd' && !isOddWeek) return false
      if (course.weekType === 'even' && isOddWeek) return false
    }

    return true
  })

  // 按开始节次排序
  todayCourses.value.sort((a, b) => a.startSection - b.startSection)
}

/**
 * 加载今日任务
 */
function loadTodayTasks() {
  const tasks = taskStorage.getTodayTasks()
  todayTasks.value = tasks
}

/**
 * 加载今日专注时长
 */
function loadTodayFocusMinutes() {
  todayFocusMinutes.value = focusStorage.getTotalMinutesToday()
}

/**
 * 获取当前周数
 */
function getWeekNumber(): number {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNumber = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  )
  return weekNumber
}

/**
 * 格式化截止时间
 */
function formatDeadline(deadline: string): string {
  const time = dayjs(deadline)
  const now = dayjs()
  const diff = time.diff(now, 'minute')

  if (diff <= 0) return '已过期'
  if (diff < 60) return `${diff}分钟后`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时后`
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
  const course = todayCourses.value.find(c => c.id === courseId)
  return course?.name || ''
}

/**
 * 获取子任务进度
 */
function getSubtaskProgress(task: Task): string {
  if (task.subtasks.length === 0) return ''
  const completed = task.subtasks.filter(s => s.isCompleted).length
  return `${completed}/${task.subtasks.length}`
}

/**
 * 获取空状态文本
 */
function getEmptyText(): string {
  if (activeCategory.value === 'all') return '今日无待办'
  if (activeCategory.value === 'study') return '暂无学习任务'
  if (activeCategory.value === 'life') return '暂无生活任务'
  if (activeCategory.value === 'high') return '暂无高优先级任务'
  if (activeCategory.value === 'uncompleted') return '所有任务已完成'
  return '暂无任务'
}

/**
 * 切换分类
 */
function filterCategory(category: 'all' | 'study' | 'life' | 'high' | 'uncompleted') {
  activeCategory.value = category
}

/**
 * 切换任务完成状态
 */
function toggleTaskComplete(taskId: string) {
  const task = todayTasks.value.find(t => t.id === taskId)
  if (task) {
    task.isCompleted = !task.isCompleted
    task.completedTime = task.isCompleted ? new Date().toISOString() : undefined
    task.updateTime = new Date().toISOString()
    taskStorage.update(task)

    // 重新加载任务列表
    loadTodayTasks()
  }
}

// ==================== 页面跳转 ====================
function goToCourse() {
  uni.switchTab({ url: '/pages/course/index' })
}

function goToCourseDetail(courseId: string) {
  uni.navigateTo({
    url: `/pages/course/detail?id=${courseId}`
  })
}

function goToTask() {
  uni.switchTab({ url: '/pages/task/index' })
}

function goToAddTask() {
  uni.navigateTo({
    url: '/pages/task/add'
  })
}

function goToAddCourse() {
  uni.navigateTo({
    url: '/pages/course/add'
  })
}

function startFocus() {
  uni.switchTab({ url: '/pages/focus/index' })
}

function goToCalendar() {
  uni.navigateTo({
    url: '/pages/calendar/index'
  })
}

function goToGPA() {
  uni.navigateTo({
    url: '/pages/gpa/index'
  })
}

function goToProfile() {
  uni.switchTab({
    url: '/pages/profile/index'
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.date {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.week {
  font-size: 28rpx;
  color: #999;
}

.stats {
  display: flex;
  justify-content: space-around;
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.task-count {
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.section-more {
  font-size: 24rpx;
  color: #007AFF;
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
  padding: 12rpx 0;
}

.progress-track {
  flex: 1;
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF 0%, #5856D6 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 22rpx;
  color: #666;
  min-width: 80rpx;
  text-align: right;
}

.task-categories {
  display: flex;
  gap: 8rpx;
  margin-bottom: 16rpx;
  overflow-x: auto;
  padding-bottom: 4rpx;
}

.category-item {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4rpx;
  transition: all 0.2s;
}

.category-item.active {
  background: #007AFF;
  color: #fff;
}

.category-count {
  font-size: 20rpx;
  opacity: 0.8;
}

.course-item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.course-item:last-child {
  border-bottom: none;
}

.course-time {
  width: 120rpx;
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
}

.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 4rpx;
}

.course-location {
  font-size: 24rpx;
  color: #999;
}

.task-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.2s;
}

.task-item:active {
  background: #f9f9f9;
}

.task-item.completed {
  opacity: 0.6;
}

.task-item:last-child {
  border-bottom: none;
}

.task-checkbox {
  width: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 4rpx;
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12rpx;
}

.task-title {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.task-title.completed {
  text-decoration: line-through;
  color: #999;
}

.priority-badge {
  flex-shrink: 0;
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  color: #fff;
}

.priority-badge.priority-high {
  background: #ff3b30;
}

.priority-badge.priority-medium {
  background: #ff9500;
}

.priority-badge.priority-low {
  background: #34c759;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #999;
}

.subtasks-preview {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  padding-left: 8rpx;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.subtask-item.completed .subtask-text {
  text-decoration: line-through;
  color: #999;
}

.subtask-text {
  font-size: 24rpx;
  color: #666;
}

.subtask-more {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  gap: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.empty-action {
  margin-top: 8rpx;
}

.action-btn {
  padding: 12rpx 32rpx;
  background: #007AFF;
  color: #fff;
  border-radius: 24rpx;
  font-size: 26rpx;
}

.empty {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 0;
}

.action-item text {
  font-size: 24rpx;
  color: #666;
}
</style>
