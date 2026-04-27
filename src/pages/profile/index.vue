<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar">
        <uni-icons type="person" size="40" color="#666" />
      </view>
      <view class="user-info">
        <text class="user-name">大学生规划</text>
        <text class="user-desc">极简规划工具</text>
      </view>
    </view>

    <!-- 统计数据 -->
    <view class="stats-row">
      <view class="stat-item">
        <text class="stat-value">{{ stats.courseCount }}</text>
        <text class="stat-label">课程</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.taskCount }}</text>
        <text class="stat-label">任务</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.goalCount }}</text>
        <text class="stat-label">目标</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.focusHours }}h</text>
        <text class="stat-label">专注</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="section">
      <text class="section-title">数据管理</text>
      <view class="menu-list">
        <view class="menu-item" @tap="exportData">
          <view class="menu-left">
            <uni-icons type="cloud-upload" size="20" color="#007AFF" />
            <text>导出数据</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc" />
        </view>
        <view class="menu-item" @tap="importData">
          <view class="menu-left">
            <uni-icons type="cloud-download" size="20" color="#007AFF" />
            <text>导入数据</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc" />
        </view>
        <view class="menu-item" @tap="clearAllData">
          <view class="menu-left">
            <uni-icons type="trash" size="20" color="#ff3b30" />
            <text>清空所有数据</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc" />
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">设置</text>
      <view class="menu-list">
        <view class="menu-item" @tap="goToSettings">
          <view class="menu-left">
            <uni-icons type="gear" size="20" color="#666" />
            <text>应用设置</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc" />
        </view>
        <view class="menu-item" @tap="goToGpaCalculator">
          <view class="menu-left">
            <uni-icons type="paperplane" size="20" color="#666" />
            <text>GPA计算器</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc" />
        </view>
        <view class="menu-item" @tap="goToLogs">
          <view class="menu-left">
            <uni-icons type="eye" size="20" color="#666" />
            <text>日志监控</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc" />
        </view>
        <view class="menu-item" @tap="goToAbout">
          <view class="menu-left">
            <uni-icons type="info" size="20" color="#666" />
            <text>关于</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { courseStorage, taskStorage, goalStorage, focusStorage } from '@/utils/storage'
import type { BackupData } from '@/types'

// ==================== 数据 ====================
const stats = ref({
  courseCount: 0,
  taskCount: 0,
  goalCount: 0,
  focusHours: 0
})

// ==================== 生命周期 ====================
onMounted(() => {
  loadStats()
})

// ==================== 方法 ====================

/**
 * 加载统计数据
 */
function loadStats() {
  stats.value = {
    courseCount: courseStorage.getAll().length,
    taskCount: taskStorage.getAll().length,
    goalCount: goalStorage.getAll().length,
    focusHours: Math.round(focusStorage.getTotalMinutesToday() / 60)
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
  uni.navigateTo({
    url: '/pages/profile/import'
  })
}

/**
 * 清空所有数据
 */
function clearAllData() {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有数据吗？此操作不可恢复！',
    confirmColor: '#ff3b30',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()

        loadStats()

        uni.showToast({
          title: '已清空',
          icon: 'success'
        })
      }
    }
  })
}

/**
 * 前往设置
 */
function goToSettings() {
  uni.navigateTo({
    url: '/pages/profile/settings'
  })
}

/**
 * 前往GPA计算器
 */
function goToGpaCalculator() {
  uni.navigateTo({
    url: '/pages/gpa/index'
  })
}

/**
 * 前往关于
 */
function goToAbout() {
  uni.navigateTo({
    url: '/pages/profile/about'
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

.user-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 48rpx 32rpx;
  background: #fff;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  flex: 1;
}

.user-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.user-desc {
  font-size: 24rpx;
  color: #999;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin: 24rpx 16rpx;
}

.stat-item {
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
  margin-bottom: 16rpx;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.menu-left text {
  font-size: 28rpx;
  color: #333;
}
</style>
