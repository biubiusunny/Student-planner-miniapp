/**
 * 本地存储工具
 * 使用微信小程序本地缓存
 */

import type {
  Course,
  Task,
  Goal,
  FocusSession,
  AppSettings,
  Grade,
  FormDraft
} from '@/types'

const STORAGE_PREFIX = 'student_planner_'

/**
 * 获取存储key
 */
function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`
}

/**
 * 同步设置数据
 */
export function setStorageSync<T>(key: string, data: T): void {
  try {
    uni.setStorageSync(getKey(key), data)
  } catch (error) {
    console.error('setStorageSync error:', error)
    uni.showToast({
      title: '存储失败',
      icon: 'none'
    })
  }
}

/**
 * 同步获取数据
 */
export function getStorageSync<T>(key: string, defaultValue?: T): T | undefined {
  try {
    const data = uni.getStorageSync(getKey(key))
    return data !== '' ? data : defaultValue
  } catch (error) {
    console.error('getStorageSync error:', error)
    return defaultValue
  }
}

/**
 * 异步设置数据
 */
export function setStorage<T>(key: string, data: T): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.setStorage({
      key: getKey(key),
      data,
      success: () => resolve(),
      fail: (error) => {
        console.error('setStorage error:', error)
        uni.showToast({
          title: '存储失败',
          icon: 'none'
        })
        reject(error)
      }
    })
  })
}

/**
 * 异步获取数据
 */
export function getStorage<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    uni.getStorage({
      key: getKey(key),
      success: (res) => resolve(res.data as T),
      fail: (error) => {
        if (error.errMsg.includes('no data')) {
          resolve(undefined)
        } else {
          console.error('getStorage error:', error)
          reject(error)
        }
      }
    })
  })
}

/**
 * 删除数据
 */
export function removeStorage(key: string): void {
  try {
    uni.removeStorageSync(getKey(key))
  } catch (error) {
    console.error('removeStorage error:', error)
  }
}

/**
 * 清空所有数据
 */
export function clearStorage(): void {
  try {
    uni.clearStorageSync()
  } catch (error) {
    console.error('clearStorage error:', error)
  }
}

/**
 * 获取存储信息
 */
export function getStorageInfo(): UniApp.GetStorageInfoSuccessCallbackResult {
  return uni.getStorageInfoSync()
}

// ==================== 业务存储方法 ====================

// 课程
export const courseStorage = {
  getAll: (): Course[] => getStorageSync<Course[]>('courses', []),
  setAll: (courses: Course[]) => setStorageSync('courses', courses),
  getById: (id: string): Course | undefined => {
    const courses = getStorageSync<Course[]>('courses', [])
    return courses.find(c => c.id === id)
  },
  add: (course: Course) => {
    const courses = getStorageSync<Course[]>('courses', [])
    courses.push(course)
    setStorageSync('courses', courses)
  },
  update: (course: Course) => {
    const courses = getStorageSync<Course[]>('courses', [])
    const index = courses.findIndex(c => c.id === course.id)
    if (index !== -1) {
      courses[index] = course
      setStorageSync('courses', courses)
    }
  },
  delete: (id: string) => {
    const courses = getStorageSync<Course[]>('courses', [])
    const filtered = courses.filter(c => c.id !== id)
    setStorageSync('courses', filtered)
  }
}

// 任务
export const taskStorage = {
  getAll: (): Task[] => getStorageSync<Task[]>('tasks', []),
  setAll: (tasks: Task[]) => setStorageSync('tasks', tasks),
  getById: (id: string): Task | undefined => {
    const tasks = getStorageSync<Task[]>('tasks', [])
    return tasks.find(t => t.id === id)
  },
  getByType: (type: TaskType): Task[] => {
    const tasks = getStorageSync<Task[]>('tasks', [])
    return tasks.filter(t => t.type === type)
  },
  getUncompleted: (): Task[] => {
    const tasks = getStorageSync<Task[]>('tasks', [])
    return tasks.filter(t => !t.isCompleted)
  },
  getTodayTasks: (): Task[] => {
    const tasks = getStorageSync<Task[]>('tasks', [])
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter(t => t.deadline.split('T')[0] === today)
  },
  add: (task: Task) => {
    const tasks = getStorageSync<Task[]>('tasks', [])
    tasks.push(task)
    setStorageSync('tasks', tasks)
  },
  update: (task: Task) => {
    const tasks = getStorageSync<Task[]>('tasks', [])
    const index = tasks.findIndex(t => t.id === task.id)
    if (index !== -1) {
      tasks[index] = task
      setStorageSync('tasks', tasks)
    }
  },
  delete: (id: string) => {
    const tasks = getStorageSync<Task[]>('tasks', [])
    const filtered = tasks.filter(t => t.id !== id)
    setStorageSync('tasks', filtered)
  }
}

// 目标
export const goalStorage = {
  getAll: (): Goal[] => getStorageSync<Goal[]>('goals', []),
  setAll: (goals: Goal[]) => setStorageSync('goals', goals),
  getById: (id: string): Goal | undefined => {
    const goals = getStorageSync<Goal[]>('goals', [])
    return goals.find(g => g.id === id)
  },
  add: (goal: Goal) => {
    const goals = getStorageSync<Goal[]>('goals', [])
    goals.push(goal)
    setStorageSync('goals', goals)
  },
  update: (goal: Goal) => {
    const goals = getStorageSync<Goal[]>('goals', [])
    const index = goals.findIndex(g => g.id === goal.id)
    if (index !== -1) {
      goals[index] = goal
      setStorageSync('goals', goals)
    }
  },
  delete: (id: string) => {
    const goals = getStorageSync<Goal[]>('goals', [])
    const filtered = goals.filter(g => g.id !== id)
    setStorageSync('goals', filtered)
  }
}

// 专注记录
export const focusStorage = {
  getAll: (): FocusSession[] => getStorageSync<FocusSession[]>('focusSessions', []),
  setAll: (sessions: FocusSession[]) => setStorageSync('focusSessions', sessions),
  getTodaySessions: (): FocusSession[] => {
    const sessions = getStorageSync<FocusSession[]>('focusSessions', [])
    const today = new Date().toISOString().split('T')[0]
    return sessions.filter(s => s.startTime.split('T')[0] === today)
  },
  getWeekSessions: (): FocusSession[] => {
    const sessions = getStorageSync<FocusSession[]>('focusSessions', [])
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return sessions.filter(s => {
      const date = new Date(s.startTime)
      return date >= weekAgo && date <= now
    })
  },
  getTotalMinutesToday: (): number => {
    const todaySessions = focusStorage.getTodaySessions()
    return todaySessions.reduce((sum, s) => sum + s.duration, 0)
  },
  add: (session: FocusSession) => {
    const sessions = getStorageSync<FocusSession[]>('focusSessions', [])
    sessions.push(session)
    setStorageSync('focusSessions', sessions)
  },
  update: (session: FocusSession) => {
    const sessions = getStorageSync<FocusSession[]>('focusSessions', [])
    const index = sessions.findIndex(s => s.id === session.id)
    if (index !== -1) {
      sessions[index] = session
      setStorageSync('focusSessions', sessions)
    }
  }
}

// 设置
export const settingsStorage = {
  get: (): AppSettings => {
    const defaultSettings: AppSettings = {
      themeMode: 'auto',
      currentSemester: '2024-2025-2',
      reminder: {
        course: 15,
        task: 30
      },
      pomodoro: {
        workDuration: 25,
        breakDuration: 5,
        autoStartBreak: false,
        autoStartWork: false
      },
      enableNotification: true,
      enableVibration: true
    }
    return getStorageSync<AppSettings>('settings', defaultSettings)
  },
  set: (settings: AppSettings) => setStorageSync('settings', settings),
  update: (partial: Partial<AppSettings>) => {
    const settings = settingsStorage.get()
    Object.assign(settings, partial)
    setStorageSync('settings', settings)
  }
}

// 成绩
export const gradeStorage = {
  getAll: (): Grade[] => getStorageSync<Grade[]>('grades', []),
  setAll: (grades: Grade[]) => setStorageSync('grades', grades),
  add: (grade: Grade) => {
    const grades = getStorageSync<Grade[]>('grades', [])
    grades.push(grade)
    setStorageSync('grades', grades)
  },
  update: (grade: Grade) => {
    const grades = getStorageSync<Grade[]>('grades', [])
    const index = grades.findIndex(g => g.id === grade.id)
    if (index !== -1) {
      grades[index] = grade
      setStorageSync('grades', grades)
    }
  },
  delete: (id: string) => {
    const grades = getStorageSync<Grade[]>('grades', [])
    const filtered = grades.filter(g => g.id !== id)
    setStorageSync('grades', filtered)
  }
}

// 表单草稿
export const draftStorage = {
  getAll: (): Record<string, FormDraft> => getStorageSync<Record<string, FormDraft>>('formDrafts', {}),
  setAll: (drafts: Record<string, FormDraft>) => setStorageSync('formDrafts', drafts),
  get: (key: string): FormDraft | undefined => {
    const drafts = getStorageSync<Record<string, FormDraft>>('formDrafts', {})
    return drafts[key]
  },
  save: (key: string, type: FormDraft['type'], data: any) => {
    const drafts = getStorageSync<Record<string, FormDraft>>('formDrafts', {})
    drafts[key] = {
      type,
      data,
      updateTime: new Date().toISOString()
    }
    setStorageSync('formDrafts', drafts)
  },
  delete: (key: string) => {
    const drafts = getStorageSync<Record<string, FormDraft>>('formDrafts', {})
    delete drafts[key]
    setStorageSync('formDrafts', drafts)
  },
  clearExpired: (expireHours: number = 24) => {
    const drafts = getStorageSync<Record<string, FormDraft>>('formDrafts', {})
    const expireTime = new Date().getTime() - expireHours * 60 * 60 * 1000
    for (const key in drafts) {
      const draft = drafts[key]
      if (new Date(draft.updateTime).getTime() < expireTime) {
        delete drafts[key]
      }
    }
    setStorageSync('formDrafts', drafts)
  }
}
