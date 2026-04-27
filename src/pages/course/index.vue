<template>
  <view class="container">
    <!-- 切换周/日视图 -->
    <view class="view-switch">
      <view
        :class="['switch-item', { active: viewType === 'week' }]"
        @tap="switchView('week')"
      >
        <text>周视图</text>
      </view>
      <view
        :class="['switch-item', { active: viewType === 'day' }]"
        @tap="switchView('day')"
      >
        <text>日视图</text>
      </view>
    </view>

    <!-- 课程列表 -->
    <view v-if="viewType === 'week'" class="week-view">
      <view class="week-days">
        <view
          v-for="day in weekDays"
          :key="day.value"
          :class="['day-item', { active: selectedDay === day.value }]"
          @tap="selectDay(day.value)"
        >
          <text class="day-name">{{ day.name }}</text>
        </view>
      </view>
      <view class="course-list">
        <view
          v-for="course in filteredCourses"
          :key="course.id"
          class="course-card"
          :style="{ borderLeftColor: course.color || '#007AFF' }"
          @tap="goToDetail(course.id)"
        >
          <view class="course-header">
            <text class="course-name">{{ course.name }}</text>
            <text class="course-section">{{ course.startSection }}-{{ course.endSection }}节</text>
          </view>
          <view class="course-body">
            <text class="course-teacher">{{ course.teacher }}</text>
            <text class="course-location">{{ course.classroom }}</text>
          </view>
          <view class="course-footer">
            <text class="course-week">{{ getWeekTypeText(course.weekType) }}</text>
          </view>
        </view>
      </view>
      <view v-if="filteredCourses.length === 0" class="empty">
        <text>今日无课程</text>
      </view>
    </view>

    <view v-else class="day-view">
      <view class="day-selector">
        <view class="selector-arrow" @tap="changeDay(-1)">
          <uni-icons type="left" size="20" />
        </view>
        <text class="selected-date">{{ formattedSelectedDate }}</text>
        <view class="selector-arrow" @tap="changeDay(1)">
          <uni-icons type="right" size="20" />
        </view>
      </view>
      <view class="course-list">
        <view
          v-for="course in filteredCourses"
          :key="course.id"
          class="course-card"
          :style="{ borderLeftColor: course.color || '#007AFF' }"
          @tap="goToDetail(course.id)"
        >
          <view class="course-header">
            <text class="course-name">{{ course.name }}</text>
            <text class="course-section">{{ course.startSection }}-{{ course.endSection }}节</text>
          </view>
          <view class="course-body">
            <text class="course-teacher">{{ course.teacher }}</text>
            <text class="course-location">{{ course.classroom }}</text>
          </view>
        </view>
      </view>
      <view v-if="filteredCourses.length === 0" class="empty">
        <text>当日无课程</text>
      </view>
    </view>

    <!-- 添加课程按钮 -->
    <view class="fab" @tap="addCourse">
      <uni-icons type="plus" size="24" color="#fff" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { courseStorage } from '@/utils/storage'
import type { Course } from '@/types'

// ==================== 数据 ====================
const viewType = ref<'week' | 'day'>('week')
const selectedDay = ref(new Date().getDay() || 7) // 默认今天
const selectedDate = ref(new Date())
const allCourses = ref<Course[]>([])

const weekDays = [
  { name: '周一', value: 1 },
  { name: '周二', value: 2 },
  { name: '周三', value: 3 },
  { name: '周四', value: 4 },
  { name: '周五', value: 5 },
  { name: '周六', value: 6 },
  { name: '周日', value: 7 }
]

// ==================== 计算属性 ====================
const filteredCourses = computed(() => {
  const settings = uni.getStorageSync('student_planner_settings')
  const currentSemester = settings?.currentSemester || '2024-2025-2'
  const dayOfWeek = viewType.value === 'week' ? selectedDay.value : selectedDate.value.getDay() || 7

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

const formattedSelectedDate = computed(() => {
  return dayjs(selectedDate.value).format('MM月DD日')
})

// ==================== 生命周期 ====================
onMounted(() => {
  loadCourses()
})

// ==================== 方法 ====================

/**
 * 加载课程列表
 */
function loadCourses() {
  allCourses.value = courseStorage.getAll()
}

/**
 * 切换视图
 */
function switchView(type: 'week' | 'day') {
  viewType.value = type
}

/**
 * 选择周几
 */
function selectDay(day: number) {
  selectedDay.value = day
}

/**
 * 切换日期
 */
function changeDay(delta: number) {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() + delta)
  selectedDate.value = newDate
}

/**
 * 获取周数
 */
function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const weekNumber = Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  )
  return weekNumber
}

/**
 * 获取周类型文本
 */
function getWeekTypeText(weekType: string): string {
  const map: Record<string, string> = {
    all: '全周',
    odd: '单周',
    even: '双周'
  }
  return map[weekType] || '全周'
}

// ==================== 页面跳转 ====================
function goToDetail(courseId: string) {
  uni.navigateTo({
    url: `/pages/course/detail?id=${courseId}`
  })
}

function addCourse() {
  uni.navigateTo({
    url: '/pages/course/add'
  })
}

// 下拉刷新
function onPullDownRefresh() {
  loadCourses()
  uni.stopPullDownRefresh()
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.view-switch {
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

.week-days {
  display: flex;
  background: #fff;
  padding: 16rpx;
  gap: 8rpx;
}

.day-item {
  flex: 1;
  text-align: center;
  padding: 12rpx 0;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.day-item.active {
  background: #007AFF;
  color: #fff;
}

.day-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #fff;
}

.selected-date {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.course-list {
  padding: 16rpx;
}

.course-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-left: 6rpx solid #007AFF;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.course-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.course-section {
  font-size: 24rpx;
  color: #999;
}

.course-body {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.course-teacher,
.course-location {
  font-size: 26rpx;
  color: #666;
}

.course-footer {
  margin-top: 8rpx;
}

.course-week {
  font-size: 24rpx;
  color: #999;
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
