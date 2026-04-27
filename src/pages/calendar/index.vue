<template>
  <view class="container">
    <!-- 日历选择器 -->
    <view class="calendar-header">
      <view class="month-nav" @tap="changeMonth(-1)">
        <uni-icons type="left" size="20" />
      </view>
      <text class="current-month">{{ formattedCurrentMonth }}</text>
      <view class="month-nav" @tap="changeMonth(1)">
        <uni-icons type="right" size="20" />
      </view>
    </view>

    <!-- 星期标题 -->
    <view class="week-header">
      <view v-for="day in weekDays" :key="day" class="week-day">
        <text>{{ day }}</text>
      </view>
    </view>

    <!-- 日历网格 -->
    <view class="calendar-grid">
      <view
        v-for="(date, index) in calendarDays"
        :key="index"
        :class="['calendar-day', {
          'current-month': date.isCurrentMonth,
          'today': date.isToday,
          'selected': isSelected(date)
        }]"
        @tap="selectDate(date)"
      >
        <text class="day-number">{{ date.day }}</text>
        <view v-if="hasEvents(date)" class="event-dot" />
      </view>
    </view>

    <!-- 当日日程 -->
    <view class="schedule-section">
      <view class="section-title">
        <text>{{ formattedSelectedDate }} 日程</text>
      </view>

      <!-- 课程 -->
      <view v-if="dayCourses.length > 0" class="schedule-group">
        <text class="group-title">课程</text>
        <view
          v-for="course in dayCourses"
          :key="course.id"
          class="schedule-item course-item"
        >
          <view class="item-time">
            <text>{{ course.startSection }}-{{ course.endSection }}节</text>
          </view>
          <view class="item-content">
            <text class="item-title">{{ course.name }}</text>
            <text class="item-location">{{ course.classroom }}</text>
          </view>
        </view>
      </view>

      <!-- 任务 -->
      <view v-if="dayTasks.length > 0" class="schedule-group">
        <text class="group-title">任务</text>
        <view
          v-for="task in dayTasks"
          :key="task.id"
          class="schedule-item task-item"
        >
          <view class="item-time">
            <text>{{ formatTaskTime(task.deadline) }}</text>
          </view>
          <view class="item-content">
            <text :class="['item-title', { completed: task.isCompleted }]">
              {{ task.title }}
            </text>
            <view :class="['priority', `priority-${task.priority}`]">
              {{ getPriorityText(task.priority) }}
            </view>
          </view>
        </view>
      </view>

      <view v-if="dayCourses.length === 0 && dayTasks.length === 0" class="empty">
        <text>当日无安排</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { courseStorage, taskStorage } from '@/utils/storage'
import type { Course, Task } from '@/types'

// ==================== 数据 ====================
const currentDate = ref(dayjs())
const selectedDate = ref(dayjs())
const allCourses = ref<Course[]>([])
const allTasks = ref<Task[]>([])

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// ==================== 计算属性 ====================
const formattedCurrentMonth = computed(() =>
  currentDate.value.format('YYYY年MM月')
)

const formattedSelectedDate = computed(() =>
  selectedDate.value.format('MM月DD日')
)

const calendarDays = computed(() => {
  const year = currentDate.value.year()
  const month = currentDate.value.month()

  // 获取当月第一天
  const firstDay = dayjs().year(year).month(month).date(1)
  // 获取当月最后一天
  const lastDay = dayjs().year(year).month(month).endOf('month')

  // 获取第一天是周几
  const startDayOfWeek = firstDay.day()

  const days: Array<{
    day: number
    date: dayjs.Dayjs
    isCurrentMonth: boolean
    isToday: boolean
  }> = []

  // 填充上个月的日期
  for (let i = 0; i < startDayOfWeek; i++) {
    const day = firstDay.subtract(startDayOfWeek - i, 'day')
    days.push({
      day: day.date(),
      date: day,
      isCurrentMonth: false,
      isToday: false
    })
  }

  // 填充当月日期
  for (let i = 1; i <= lastDay.date(); i++) {
    const day = firstDay.date(i)
    days.push({
      day: i,
      date: day,
      isCurrentMonth: true,
      isToday: day.isSame(dayjs(), 'day')
    })
  }

  // 填充下个月的日期
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const day = lastDay.add(i, 'day')
    days.push({
      day: i,
      date: day,
      isCurrentMonth: false,
      isToday: false
    })
  }

  return days
})

const dayCourses = computed(() => {
  const dayOfWeek = selectedDate.value.day() || 7
  const settings = uni.getStorageSync('student_planner_settings')
  const currentSemester = settings?.currentSemester || '2024-2025-2'
  const selectedDateStr = selectedDate.value.format('YYYY-MM-DD')

  return allCourses.value.filter(course => {
    if (course.semester !== currentSemester) return false
    if (course.dayOfWeek !== dayOfWeek) return false

    // 检查单双周
    if (course.weekType === 'odd' || course.weekType === 'even') {
      const weekNumber = getWeekNumber(selectedDate.value)
      const isOddWeek = weekNumber % 2 === 1
      if (course.weekType === 'odd' && !isOddWeek) return false
      if (course.weekType === 'even' && isOddWeek) return false
    }

    return true
  }).sort((a, b) => a.startSection - b.startSection)
})

const dayTasks = computed(() => {
  const selectedDateStr = selectedDate.value.format('YYYY-MM-DD')
  return allTasks.value.filter(task => {
    const taskDate = dayjs(task.deadline).format('YYYY-MM-DD')
    return taskDate === selectedDateStr
  }).sort((a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf())
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
  allCourses.value = courseStorage.getAll()
  allTasks.value = taskStorage.getAll()
}

/**
 * 切换月份
 */
function changeMonth(delta: number) {
  currentDate.value = currentDate.value.add(delta, 'month')
}

/**
 * 选择日期
 */
function selectDate(item: { date: dayjs.Dayjs }) {
  selectedDate.value = item.date
}

/**
 * 判断是否选中
 */
function isSelected(item: { date: dayjs.Dayjs }): boolean {
  return selectedDate.value.isSame(item.date, 'day')
}

/**
 * 判断是否有事件
 */
function hasEvents(item: { date: dayjs.Dayjs }): boolean {
  const dateStr = item.date.format('YYYY-MM-DD')
  const dayOfWeek = item.date.day() || 7

  // 检查课程
  const hasCourse = allCourses.value.some(course => {
    const settings = uni.getStorageSync('student_planner_settings')
    const currentSemester = settings?.currentSemester || '2024-2025-2'
    if (course.semester !== currentSemester) return false
    if (course.dayOfWeek !== dayOfWeek) return false
    return true
  })

  // 检查任务
  const hasTask = allTasks.value.some(task => {
    const taskDate = dayjs(task.deadline).format('YYYY-MM-DD')
    return taskDate === dateStr
  })

  return hasCourse || hasTask
}

/**
 * 获取周数
 */
function getWeekNumber(date: dayjs.Dayjs): number {
  const startOfYear = dayjs().year(date.year()).startOf('year')
  const weekNumber = Math.ceil(
    (date.diff(startOfYear, 'day') + startOfYear.day() + 1) / 7
  )
  return weekNumber
}

/**
 * 格式化任务时间
 */
function formatTaskTime(deadline: string): string {
  return dayjs(deadline).format('HH:mm')
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
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  background: #fff;
}

.month-nav {
  padding: 8rpx;
}

.current-month {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 16rpx 0;
  background: #fff;
}

.week-day {
  text-align: center;
  font-size: 24rpx;
  color: #999;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 16rpx;
  background: #fff;
  gap: 8rpx;
}

.calendar-day {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
}

.calendar-day.current-month {
  color: #333;
}

.calendar-day:not(.current-month) {
  color: #ccc;
}

.calendar-day.today {
  background: #e8f4ff;
  color: #007AFF;
  font-weight: bold;
}

.calendar-day.selected {
  background: #007AFF;
  color: #fff;
}

.day-number {
  font-size: 28rpx;
}

.event-dot {
  position: absolute;
  bottom: 8rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 8rpx;
  height: 8rpx;
  background: #ff3b30;
  border-radius: 50%;
}

.schedule-section {
  padding: 24rpx 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.schedule-group {
  margin-bottom: 24rpx;
}

.group-title {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.schedule-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 12rpx;
  display: flex;
  gap: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.item-time {
  width: 120rpx;
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
}

.item-content {
  flex: 1;
}

.item-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.item-title.completed {
  text-decoration: line-through;
  color: #999;
}

.item-location {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.course-item {
  border-left: 4rpx solid #007AFF;
}

.task-item {
  border-left: 4rpx solid #34c759;
}

.priority {
  display: inline-block;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  font-size: 20rpx;
  color: #fff;
  margin-top: 8rpx;
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

.empty {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
