<template>
  <view class="container">
    <view v-if="course" class="content">
      <!-- 课程头部 -->
      <view class="course-header">
        <view class="course-icon" :style="{ background: course.color || '#007AFF' }">
          <text class="icon-text">{{ course.name.substring(0, 1) }}</text>
        </view>
        <view class="course-info">
          <text class="course-name">{{ course.name }}</text>
          <text class="course-teacher">{{ course.teacher }}</text>
        </view>
      </view>

      <!-- 课程信息卡片 -->
      <view class="section">
        <text class="section-title">课程信息</text>
        <view class="info-list">
          <view class="info-item">
            <uni-icons type="location" size="18" color="#999" />
            <text class="info-label">教室</text>
            <text class="info-value">{{ course.classroom }}</text>
          </view>
          <view class="info-item">
            <uni-icons type="calendar" size="18" color="#999" />
            <text class="info-label">上课时间</text>
            <text class="info-value">{{ getWeekDayText(course.dayOfWeek) }} {{ course.startSection }}-{{ course.endSection }}节</text>
          </view>
          <view class="info-item">
            <uni-icons type="loop" size="18" color="#999" />
            <text class="info-label">周类型</text>
            <text class="info-value">{{ getWeekTypeText(course.weekType) }}</text>
          </view>
          <view class="info-item">
            <uni-icons type="flag" size="18" color="#999" />
            <text class="info-label">学期</text>
            <text class="info-value">{{ course.semester }}</text>
          </view>
        </view>
      </view>

      <!-- 课程颜色 -->
      <view class="section">
        <text class="section-title">课程颜色</text>
        <view class="color-picker">
          <view
            v-for="color in colors"
            :key="color"
            :class="['color-item', { active: course.color === color }]"
            :style="{ background: color }"
            @tap="selectColor(color)"
          />
        </view>
      </view>

      <!-- 关联作业 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">作业任务</text>
          <view class="add-btn" @tap="addAssignment">
            <uni-icons type="plus" size="18" color="#007AFF" />
            <text>添加</text>
          </view>
        </view>
        <view v-if="assignments.length > 0" class="assignment-list">
          <view
            v-for="assignment in assignments"
            :key="assignment.id"
            class="assignment-item"
            @tap="goToTask(assignment.id)"
          >
            <view class="assignment-left">
              <uni-icons
                :type="assignment.isCompleted ? 'checkmarkempty' : 'circle'"
                :color="assignment.isCompleted ? '#34c759' : '#999'"
                size="20"
              />
              <text :class="['assignment-title', { completed: assignment.isCompleted }]">
                {{ assignment.title }}
              </text>
            </view>
            <view class="assignment-right">
              <text class="assignment-deadline">{{ formatDeadline(assignment.deadline) }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty">
          <text>暂无作业</text>
        </view>
      </view>

      <!-- 课程统计 -->
      <view class="section">
        <text class="section-title">统计信息</text>
        <view class="stats-grid">
          <view class="stat-card">
            <text class="stat-value">{{ totalClasses }}</text>
            <text class="stat-label">总课时</text>
          </view>
          <view class="stat-card">
            <text class="stat-value">{{ remainingClasses }}</text>
            <text class="stat-label">剩余课时</text>
          </view>
          <view class="stat-card">
            <text class="stat-value">{{ assignments.length }}</text>
            <text class="stat-label">作业数</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-btn secondary" @tap="editCourse">
        <uni-icons type="compose" size="20" />
        <text>编辑</text>
      </view>
      <view class="action-btn danger" @tap="deleteCourse">
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
import { courseStorage, taskStorage } from '@/utils/storage'
import type { Course, Task } from '@/types'

// ==================== 数据 ====================
const courseId = ref('')
const course = ref<Course | null>(null)
const assignments = ref<Task[]>([])

const colors = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30',
  '#5856D6', '#AF52DE', '#FF2D55', '#5AC8FA'
]

// ==================== 计算属性 ====================
const totalClasses = computed(() => {
  if (!course.value) return 0
  // 计算本学期总课时（假设16周）
  const weekMultiplier = course.value.weekType === 'all' ? 16 : 8
  return weekMultiplier
})

const remainingClasses = computed(() => {
  if (!course.value) return 0
  const now = dayjs()
  const endOfSemester = dayjs().endOf('month') // 简化计算
  // 实际应该根据当前周数计算剩余课时
  return Math.floor(totalClasses.value * 0.7) // 示例值
})

// ==================== 生命周期 ====================
onLoad((options) => {
  if (options?.id) {
    courseId.value = options.id
    loadCourseData()
  }
})

// ==================== 方法 ====================

/**
 * 加载课程数据
 */
function loadCourseData() {
  course.value = courseStorage.getById(courseId.value)
  loadAssignments()
}

/**
 * 加载作业列表
 */
function loadAssignments() {
  const allTasks = taskStorage.getAll()
  assignments.value = allTasks.filter(task => task.courseId === courseId.value)
    .sort((a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf())
}

/**
 * 选择颜色
 */
function selectColor(color: string) {
  if (!course.value) return

  course.value.color = color
  course.value.updateTime = new Date().toISOString()
  courseStorage.update(course.value)

  uni.showToast({
    title: '颜色已更新',
    icon: 'success'
  })
}

/**
 * 获取星期文本
 */
function getWeekDayText(dayOfWeek: number): string {
  const map: Record<number, string> = {
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
    7: '周日'
  }
  return map[dayOfWeek] || ''
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

/**
 * 格式化截止时间
 */
function formatDeadline(deadline: string): string {
  return dayjs(deadline).format('MM-DD HH:mm')
}

/**
 * 添加作业
 */
function addAssignment() {
  uni.navigateTo({
    url: `/pages/task/add?courseId=${courseId.value}`
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
 * 编辑课程
 */
function editCourse() {
  if (!course.value) return
  uni.navigateTo({
    url: `/pages/course/edit?id=${course.value.id}`
  })
}

/**
 * 删除课程
 */
function deleteCourse() {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这门课程吗？删除后无法恢复。',
    confirmColor: '#ff3b30',
    success: (res) => {
      if (res.confirm && course.value) {
        courseStorage.delete(course.value.id)

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

.course-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
  background: #fff;
  margin-bottom: 16rpx;
}

.course-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
}

.course-info {
  flex: 1;
}

.course-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.course-teacher {
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

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.color-item {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  border: 4rpx solid transparent;
  transition: all 0.2s;
}

.color-item.active {
  border-color: #333;
}

.assignment-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.assignment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
}

.assignment-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.assignment-title {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.assignment-title.completed {
  text-decoration: line-through;
  color: #999;
}

.assignment-right {
  display: flex;
  align-items: center;
}

.assignment-deadline {
  font-size: 24rpx;
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
