/**
 * 通用工具函数
 */

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const dayjs = require('dayjs')
  return dayjs(date).format(format)
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date): string {
  const dayjs = require('dayjs')
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 格式化时间
 */
export function formatTime(date: string | Date): string {
  const dayjs = require('dayjs')
  return dayjs(date).format('HH:mm')
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: string | Date): string {
  const dayjs = require('dayjs')
  const now = dayjs()
  const target = dayjs(date)
  const diffMinutes = target.diff(now, 'minute')
  const diffHours = target.diff(now, 'hour')
  const diffDays = target.diff(now, 'day')

  if (diffMinutes < 0) return '已过期'
  if (diffMinutes < 1) return '1分钟内'
  if (diffMinutes < 60) return `${diffMinutes}分钟后`
  if (diffHours < 24) return `${diffHours}小时后`
  if (diffDays < 7) return `${diffDays}天后`
  return target.format('MM-DD')
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null

  return function(this: any, ...args: Parameters<T>) {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null
  let previous = 0

  return function(this: any, ...args: Parameters<T>) {
    const context = this
    const now = Date.now()

    if (now - previous > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      func.apply(context, args)
      previous = now
    } else if (!timeout) {
      timeout = setTimeout(() => {
        func.apply(context, args)
        previous = Date.now()
        timeout = null
      }, wait - (now - previous))
    }
  }
}

/**
 * 获取随机颜色
 */
export function getRandomColor(): string {
  const colors = [
    '#007AFF', '#34C759', '#FF9500', '#FF3B30',
    '#5856D6', '#AF52DE', '#FF2D55', '#5AC8FA'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * 验证手机号格式
 */
export function isValidPhone(phone: string): boolean {
  const regex = /^1[3-9]\d{9}$/
  return regex.test(phone)
}

/**
 * 计算GPA
 */
export function calculateGPA(grades: Array<{ score: number; credit: number }>): number {
  if (grades.length === 0) return 0

  const totalCredit = grades.reduce((sum, item) => sum + item.credit, 0)
  const totalPoints = grades.reduce((sum, item) => {
    const point = scoreToPoint(item.score)
    return sum + point * item.credit
  }, 0)

  return totalCredit > 0 ? totalPoints / totalCredit : 0
}

/**
 * 分数转绩点
 */
export function scoreToPoint(score: number): number {
  if (score >= 90) return 4.0
  if (score >= 85) return 3.7
  if (score >= 82) return 3.3
  if (score >= 78) return 3.0
  if (score >= 75) return 2.7
  if (score >= 72) return 2.3
  if (score >= 68) return 2.0
  if (score >= 64) => 1.5
  if (score >= 60) return 1.0
  return 0.0
}

/**
 * 获取周数
 */
export function getWeekNumber(date: Date = new Date()): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const weekNumber = Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  )
  return weekNumber
}

/**
 * 获取学期信息
 */
export function getSemesterInfo(date: Date = new Date()): { semester: string; weekNumber: number } {
  const year = date.getFullYear()
  const month = date.getMonth()

  let semester: string
  if (month >= 2 && month <= 7) {
    semester = `${year}-${year + 1}-2` // 春季学期
  } else if (month >= 8) {
    semester = `${year}-${year + 1}-1` // 秋季学期
  } else {
    semester = `${year - 1}-${year}-1` // 上一年秋季
  }

  const weekNumber = getWeekNumber(date)

  return { semester, weekNumber }
}

/**
 * 显示Loading
 */
export function showLoading(title: string = '加载中...'): void {
  uni.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏Loading
 */
export function hideLoading(): void {
  uni.hideLoading()
}

/**
 * 显示成功提示
 */
export function showSuccess(title: string): void {
  uni.showToast({
    title,
    icon: 'success'
  })
}

/**
 * 显示错误提示
 */
export function showError(title: string): void {
  uni.showToast({
    title,
    icon: 'none'
  })
}

/**
 * 确认对话框
 */
export function showConfirm(
  title: string,
  content: string
): Promise<boolean> {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 显示操作菜单
 */
export function showActionSheet(itemList: string[]): Promise<number> {
  return new Promise((resolve) => {
    uni.showActionSheet({
      itemList,
      success: (res) => {
        resolve(res.tapIndex)
      },
      fail: () => {
        resolve(-1)
      }
    })
  })
}

/**
 * 复制到剪贴板
 */
export function copyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.setClipboardData({
      data: text,
      success: () => {
        uni.showToast({
          title: '已复制',
          icon: 'success'
        })
        resolve()
      },
      fail: reject
    })
  })
}

/**
 * 保存图片到相册
 */
export function saveImageToPhotos(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        uni.showToast({
          title: '已保存',
          icon: 'success'
        })
        resolve()
      },
      fail: reject
    })
  })
}

/**
 * 拨打电话
 */
export function makePhoneCall(phoneNumber: string): void {
  uni.makePhoneCall({
    phoneNumber
  })
}

/**
 * 打开地图导航
 */
export function openMapNavigation(
  latitude: number,
  longitude: number,
  name: string = ''
): void {
  uni.openLocation({
    latitude,
    longitude,
    name
  })
}
