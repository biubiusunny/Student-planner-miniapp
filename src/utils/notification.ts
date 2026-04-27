/**
 * 微信小程序订阅消息工具
 */

// 订阅消息模板ID（需要在微信公众平台配置）
export const TEMPLATE_IDS = {
  COURSE_REMINDER: '', // 课程提醒模板ID
  TASK_REMINDER: '', // 任务提醒模板ID
  GOAL_PROGRESS: '', // 目标进度模板ID
} as const

/**
 * 请求订阅消息权限
 */
export function requestSubscribeMessage(templateIds: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.requestSubscribeMessage({
      tmplIds: templateIds,
      success: (res) => {
        console.log('订阅消息成功:', res)
        resolve()
      },
      fail: (err) => {
        console.error('订阅消息失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 发送课程提醒
 * 注意：小程序端无法直接发送模板消息，需要后端服务调用微信API
 * 这里仅保留接口定义，实际使用需要后端支持
 */
export function sendCourseReminder(data: {
  courseId: string
  courseName: string
  teacher: string
  classroom: string
  startTime: string
}): void {
  // 检查是否有后端服务
  // TODO: 调用后端API发送模板消息
  console.log('发送课程提醒:', data)
  uni.showToast({
    title: '提醒已设置',
    icon: 'success'
  })
}

/**
 * 发送任务提醒
 */
export function sendTaskReminder(data: {
  taskId: string
  taskTitle: string
  deadline: string
  priority: string
}): void {
  // TODO: 调用后端API发送模板消息
  console.log('发送任务提醒:', data)
  uni.showToast({
    title: '提醒已设置',
    icon: 'success'
  })
}

/**
 * 发送目标进度通知
 */
export function sendGoalProgress(data: {
  goalId: string
  goalTitle: string
  progress: number
}): void {
  // TODO: 调用后端API发送模板消息
  console.log('发送目标进度:', data)
}

/**
 * 检查订阅状态
 */
export function checkSubscriptionStatus(templateId: string): boolean {
  const settings = uni.getStorageSync('student_planner_settings')
  const subscriptions = settings?.subscriptions || {}
  return subscriptions[templateId] || false
}

/**
 * 更新订阅状态
 */
export function updateSubscriptionStatus(templateId: string, subscribed: boolean): void {
  const settings = uni.getStorageSync('student_planner_settings') || {}
  if (!settings.subscriptions) {
    settings.subscriptions = {}
  }
  settings.subscriptions[templateId] = subscribed
  uni.setStorageSync('student_planner_settings', settings)
}

/**
 * 批量请求订阅
 * 用于引导用户订阅所有必要的消息模板
 */
export async function requestAllSubscriptions(): Promise<void> {
  const neededTemplates: string[] = []

  // 检查哪些模板需要订阅
  if (!checkSubscriptionStatus(TEMPLATE_IDS.COURSE_REMINDER)) {
    neededTemplates.push(TEMPLATE_IDS.COURSE_REMINDER)
  }
  if (!checkSubscriptionStatus(TEMPLATE_IDS.TASK_REMINDER)) {
    neededTemplates.push(TEMPLATE_IDS.TASK_REMINDER)
  }
  if (!checkSubscriptionStatus(TEMPLATE_IDS.GOAL_PROGRESS)) {
    neededTemplates.push(TEMPLATE_IDS.GOAL_PROGRESS)
  }

  if (neededTemplates.length === 0) {
    uni.showToast({
      title: '已订阅所有消息',
      icon: 'success'
    })
    return
  }

  try {
    await requestSubscribeMessage(neededTemplates)

    // 更新订阅状态
    neededTemplates.forEach(templateId => {
      updateSubscriptionStatus(templateId, true)
    })

    uni.showToast({
      title: '订阅成功',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '订阅失败',
      icon: 'none'
    })
  }
}

/**
 * 本地通知（使用小程序内部提醒）
 * 适用于没有后端服务的情况
 */
export function showLocalNotification(title: string, content: string): void {
  // 小程序没有本地通知API，使用Toast替代
  uni.showToast({
    title: title,
    icon: 'none',
    duration: 2000
  })

  // 同时使用震动提醒
  uni.vibrateShort({
    success: () => {
      console.log('震动成功')
    }
  })
}

/**
 * 设置课程提醒（定时检查）
 * 使用小程序后台任务或setInterval
 */
let reminderTimer: number | null = null

export function startReminderChecker(): void {
  // 每5分钟检查一次
  reminderTimer = setInterval(() => {
    checkReminders()
  }, 5 * 60 * 1000)
}

export function stopReminderChecker(): void {
  if (reminderTimer) {
    clearInterval(reminderTimer)
    reminderTimer = null
  }
}

/**
 * 检查需要提醒的事项
 */
function checkReminders(): void {
  const settings = uni.getStorageSync('student_planner_settings')
  if (!settings?.enableNotification) return

  const now = new Date()
  const courses = uni.getStorageSync('student_planner_courses') || []
  const tasks = uni.getStorageSync('student_planner_tasks') || []

  // 检查课程提醒
  const courseReminderMinutes = settings.reminder?.course || 15
  courses.forEach((course: any) => {
    // TODO: 根据课程时间计算提醒时间
    // 这里需要解析课程时间并判断是否需要提醒
  })

  // 检查任务提醒
  const taskReminderMinutes = settings.reminder?.task || 30
  tasks.forEach((task: any) => {
    if (task.isCompleted) return

    const deadline = new Date(task.deadline)
    const diffMinutes = (deadline.getTime() - now.getTime()) / (1000 * 60)

    if (diffMinutes <= taskReminderMinutes && diffMinutes > 0 && !task.notified) {
      showLocalNotification('任务提醒', `${task.title} 将在 ${taskReminderMinutes} 分钟后截止`)
      task.notified = true
      uni.setStorageSync('student_planner_tasks', tasks)
    }
  })
}

/**
 * 初始化提醒系统
 */
export function initReminderSystem(): void {
  // 检查是否启用通知
  const settings = uni.getStorageSync('student_planner_settings')
  if (settings?.enableNotification) {
    startReminderChecker()
  }
}

/**
 * 清理提醒系统
 */
export function cleanupReminderSystem(): void {
  stopReminderChecker()
}

// 在App.vue的onLaunch中调用initReminderSystem
// 在App.vue的onHide中调用cleanupReminderSystem
