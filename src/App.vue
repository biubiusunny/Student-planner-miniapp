<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { initReminderSystem, cleanupReminderSystem } from '@/utils/notification'
import { info, error, warn } from '@/utils/logger'

onLaunch(() => {
  info('App Launch', 'App')
  // 初始化主题
  initTheme()
  // 初始化提醒系统
  initReminderSystem()
})

onShow(() => {
  info('App Show', 'App')
})

onHide(() => {
  info('App Hide', 'App')
  // 清理提醒系统
  cleanupReminderSystem()
})

/**
 * 初始化主题
 */
function initTheme() {
  try {
    const settings = uni.getStorageSync('student_planner_settings')
    if (settings && settings.themeMode) {
      const theme = settings.themeMode
      if (theme === 'dark') {
        uni.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: '#1a1a1a'
        })
      } else {
        uni.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: '#ffffff'
        })
      }
    }
  } catch (error) {
    error('初始化主题失败', 'App', { error })
  }
}
</script>

<style lang="scss">
/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  page {
    background-color: #1a1a1a;
    color: #fff;
  }
}

/* 通用类 */
.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-row {
  flex-direction: row;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-around {
  justify-content: space-around;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.mt-1 { margin-top: 8rpx; }
.mt-2 { margin-top: 16rpx; }
.mt-3 { margin-top: 24rpx; }
.mt-4 { margin-top: 32rpx; }

.mb-1 { margin-bottom: 8rpx; }
.mb-2 { margin-bottom: 16rpx; }
.mb-3 { margin-bottom: 24rpx; }
.mb-4 { margin-bottom: 32rpx; }

.ml-1 { margin-left: 8rpx; }
.ml-2 { margin-left: 16rpx; }
.ml-3 { margin-left: 24rpx; }

.mr-1 { margin-right: 8rpx; }
.mr-2 { margin-right: 16rpx; }
.mr-3 { margin-right: 24rpx; }

.p-1 { padding: 8rpx; }
.p-2 { padding: 16rpx; }
.p-3 { padding: 24rpx; }
.p-4 { padding: 32rpx; }

.w-full { width: 100%; }
.h-full { height: 100%; }

.card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

/* 深色模式卡片 */
@media (prefers-color-scheme: dark) {
  .card {
    background: #2a2a2a;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 32rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #007aff;
  color: #fff;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-danger {
  background: #ff3b30;
  color: #fff;
}

/* 优先级标签 */
.priority-high {
  background: #ff3b30;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 20rpx;
}

.priority-medium {
  background: #ff9500;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 20rpx;
}

.priority-low {
  background: #34c759;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 20rpx;
}
</style>
