<template>
  <view class="container">
    <!-- 日志级别筛选 -->
    <view class="filter-bar">
      <view class="filter-item" @tap="filterByLevel('all')">
        <text :class="['filter-text', { active: filterLevel === 'all' }]">全部</text>
      </view>
      <view class="filter-item" @tap="filterByLevel('error')">
        <text :class="['filter-text', { active: filterLevel === 'error' }]">错误</text>
      </view>
      <view class="filter-item" @tap="filterByLevel('warn')">
        <text :class="['filter-text', { active: filterLevel === 'warn' }]">警告</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <uni-icons type="search" size="18" color="#999" />
      <input
        v-model="searchKeyword"
        class="search-input"
        placeholder="搜索日志..."
        @confirm="handleSearch"
      />
      <view v-if="searchKeyword" class="clear-btn" @tap="clearSearch">
        <uni-icons type="closeempty" size="18" color="#999" />
      </view>
    </view>

    <!-- 日志列表 -->
    <view class="log-list">
      <view
        v-for="(log, index) in filteredLogs"
        :key="index"
        :class="['log-item', `log-${log.level.toLowerCase()}`]"
        @tap="toggleDetail(index)"
      >
        <view class="log-header">
          <text class="log-time">{{ formatTime(log.timestamp) }}</text>
          <text class="log-level">{{ log.levelLabel }}</text>
          <text class="log-module">{{ log.module }}</text>
        </view>
        <view class="log-content">
          <text class="log-message">{{ log.message }}</text>
        </view>
        <!-- 详情展开 -->
        <view v-if="log.expanded" class="log-detail">
          <text v-if="log.extra" class="detail-text">{{ formatExtra(log.extra) }}</text>
          <view v-if="log.extra" class="detail-raw">
            <text class="detail-title">原始数据:</text>
            <text class="detail-code">{{ JSON.stringify(log.extra) }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
    <view v-if="filteredLogs.length === 0" class="empty">
      <uni-icons type="file-text" size="64" color="#ccc" />
      <text class="empty-text">暂无日志</text>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="btn secondary" @tap="exportLogs">
        <text>导出</text>
      </view>
      <view class="btn danger" @tap="clearLogs">
        <text>清空</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAllLogs, getErrorLogs, clearOldLogs, clearAllLogs, exportLogs } from '@/utils/logger'
import type { LogEntry } from '@/utils/logger'
import dayjs from 'dayjs'

// ==================== 数据 ====================
const filterLevel = ref<'all' | 'error' | 'warn'>('all')
const searchKeyword = ref('')
const filteredLogs = ref<LogEntry[]>([])

// ==================== 计算属性 ====================
const allLogs = computed(() => getAllLogs())

const filteredLogs = computed(() => {
  let logs = allLogs.value

  // 按级别筛选
  if (filterLevel.value === 'error') {
    logs = logs.filter(l => l.level === 3 || l.level === 4) // ERROR or FATAL
  } else if (filterLevel.value === 'warn') {
    logs = logs.filter(l => l.level >= 2) // WARN及以上
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    logs = logs.filter(log =>
      log.message.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      log.module.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 按时间倒序
  return logs.reverse()
})

// ==================== 生命周期 ====================
onLoad(() => {
  loadLogs()
})

onMounted(() => {
  // 定期清理旧日志
  setInterval(() => {
    clearOldLogs(7) // 清理7天前的日志
  }, 24 * 60 * 60 * 1000) // 每天一次
})

// ==================== 方法 ====================

/**
 * 加载日志
 */
function loadLogs() {
  filteredLogs.value = getAllLogs()
}

/**
 * 按级别筛选
 */
function filterByLevel(level: 'all' | 'error' | 'warn') {
  filterLevel.value = level
}

/**
 * 搜索
 */
function handleSearch() {
  // searchKeyword的computed会自动过滤
}

/**
 * 清除搜索
 */
function clearSearch() {
  searchKeyword.value = ''
}

/**
 * 切换详情展开
 */
function toggleDetail(index: number) {
  filteredLogs.value[index].expanded = !filteredLogs.value[index].expanded
}

/**
 * 格式化时间
 */
function formatTime(timestamp: string): string {
  return dayjs(timestamp).format('MM-DD HH:mm:ss')
}

/**
 * 格式化额外数据
 */
function formatExtra(extra: any): string {
  if (!extra) return ''
  if (typeof extra === 'object') {
    return JSON.stringify(extra, null, 2)
  }
  return String(extra)
}

/**
 * 导出日志
 */
function exportLogs() {
  const logs = exportLogs()

  uni.showModal({
    title: '导出日志',
    content: `共 ${logs.length} 条日志，是否导出？`,
    success: (res) => {
      if (res.confirm) {
        // 保存到文件
        const fileName = `logs_${Date.now()}.json`
        const fs = uni.getFileSystemManager()

        try {
          const tempPath = `${wx.env.USER_DATA_PATH}/${fileName}`
          fs.writeFile({
            filePath: tempPath,
            data: logs,
            encoding: 'utf8',
            success: () => {
              uni.showModal({
                title: '导出成功',
                content: `文件已保存到：logs目录`,
                showCancel: false
              })
            },
            fail: () => {
              uni.showToast({
                title: '导出失败',
                icon: 'none'
              })
            }
          })
        } catch (error) {
          console.error('导出失败:', error)
          uni.showToast({
            title: '导出失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

/**
 * 清空日志
 */
function clearLogs() {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有日志吗？此操作不可恢复！',
    confirmColor: '#ff3b30',
    success: (res) => {
      if (res.confirm) {
        clearAllLogs()
        loadLogs()
        uni.showToast({
          title: '已清空',
          icon: 'success'
        })
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

.filter-bar {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  background: #fff;
}

.filter-item {
  flex: 1;
  text-align: center;
}

.filter-text {
  font-size: 28rpx;
  color: #666;
  padding: 12rpx 0;
  position: relative;
}

.filter-text.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2rpx;
  background: #007AFF;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 16rpx;
  padding: 0 24rpx;
  background: #fff;
  border-radius: 8rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.clear-btn {
  padding: 8rpx;
}

.log-list {
  padding: 16rpx;
  max-height: calc(100vh - 400rpx);
  overflow-y: auto;
}

.log-item {
  background: #fff;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
  overflow: hidden;
}

.log-item.log-error,
.log-item.log-fatal {
  border-left: 4rpx solid #ff3b30;
}

.log-item.log-warn {
  border-left: 4rpx solid #ff9500;
}

.log-item.log-debug,
.log-item.log-info {
  border-left: 4rpx solid #007AFF;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 16rpx;
  background: #f9f9f9;
}

.log-time {
  font-size: 22rpx;
  color: #999;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
}

.log-level {
  font-size: 22rpx;
  font-weight: bold;
}

.log-level.log-error {
  color: #ff3b30;
}

.log-level.log-warn {
  color: #ff9500;
}

.log-level.log-info {
  color: #007AFF;
}

.log-module {
  flex: 1;
  font-size: 24rpx;
  color: #666;
}

.log-content {
  padding: 12rpx 16rpx;
}

.log-message {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.log-detail {
  margin-top: 8rpx;
  padding: 12rpx 16rpx;
  background: #f9f9f9;
  border-radius: 6rpx;
}

.detail-text {
  font-size: 24rpx;
  color: #666;
  word-break: break-all;
}

.detail-raw {
  margin-top: 12rpx;
  padding: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
}

.detail-title {
  font-size: 20rpx;
  color: #999;
  margin-bottom: 4rpx;
}

.detail-code {
  font-size: 18rpx;
  color: #999;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  gap: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.action-bar {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: bold;
}

.btn.secondary {
  background: #f5f5f5;
  color: #333;
}

.btn.danger {
  background: #fff5f5;
  color: #ff3b30;
}
</style>
