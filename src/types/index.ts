/**
 * 核心数据类型定义
 */

// ==================== 课程相关 ====================
export type WeekType = 'all' | 'odd' | 'even'
export type Priority = 'high' | 'medium' | 'low'
export type TaskType = 'study' | 'life'
export type GoalType = 'semester' | 'exam' | 'habit'
export type GoalTemplate = 'cet4' | 'cet6' | 'kaoyan' | 'final'

/**
 * 课程信息
 */
export interface Course {
  id: string
  name: string
  teacher: string
  classroom: string
  dayOfWeek: number // 1-7 (周一到周日)
  startSection: number // 开始节次 (1-12)
  endSection: number // 结束节次 (1-12)
  weekType: WeekType // 全周/单周/双周
  semester: string // 学期标识 (如 "2024-2025-1")
  color?: string // 课程颜色
  createTime: string
  updateTime: string
}

/**
 * 调课/停课记录
 */
export interface CourseAdjustment {
  id: string
  courseId: string
  type: 'adjust' | 'cancel' // 调课/停课
  date: string // 调整日期
  originalTime: string // 原时间
  newTime?: string // 新时间 (调课时)
  newClassroom?: string // 新教室 (调课时)
  notified: boolean // 是否已通知
}

// ==================== 任务相关 ====================
/**
 * 子任务
 */
export interface SubTask {
  id: string
  title: string
  isCompleted: boolean
  order: number // 排序
}

/**
 * 任务
 */
export interface Task {
  id: string
  title: string
  type: TaskType // 学习任务 / 生活任务
  deadline: string // 截止时间
  priority: Priority
  courseId?: string // 关联课程ID
  subtasks: SubTask[]
  isCompleted: boolean
  completedTime?: string
  createTime: string
  updateTime: string
  notified: boolean // 是否已提醒
}

/**
 * 作业/考试关联课程入口
 */
export interface Assignment {
  id: string
  courseId: string
  type: 'homework' | 'exam'
  title: string
  deadline: string
  isCompleted: boolean
}

// ==================== 目标相关 ====================
/**
 * 里程碑
 */
export interface Milestone {
  id: string
  title: string
  targetProgress: number // 目标进度值
  deadline?: string
  isCompleted: boolean
  completedTime?: string
  order: number // 排序
}

/**
 * 进度记录
 */
export interface ProgressRecord {
  id: string
  progress: number // 当前进度值
  delta: number // 变化量
  note?: string // 备注
  createTime: string
}

/**
 * 目标
 */
export interface Goal {
  id: string
  title: string
  type: GoalType
  totalProgress: number // 总进度
  currentProgress: number // 当前进度
  weight: number // 权重 (1-10, 默认5)
  tasks: string[] // 关联任务ID数组
  milestones: Milestone[] // 里程碑
  progressHistory: ProgressRecord[] // 进度记录历史
  template?: GoalTemplate // 预设模板
  deadline?: string
  createTime: string
  updateTime: string
}

/**
 * 阶段性任务（用于目标拆解）
 */
export interface GoalTask {
  id: string
  goalId: string
  title: string
  order: number
  isCompleted: boolean
  completedTime?: string
}

// ==================== 专注模式相关 ====================
/**
 * 白噪音类型
 */
export type NoiseType = 'rain' | 'forest' | 'coffee' | 'library' | 'silence'

/**
 * 专注记录
 */
export interface FocusSession {
  id: string
  taskId?: string // 关联任务ID
  duration: number // 持续时间(分钟)
  startTime: string
  endTime: string
  noiseType: NoiseType
  completed: boolean
  createTime: string
}

/**
 * 番茄钟配置
 */
export interface PomodoroConfig {
  workDuration: number // 工作时长(分钟)
  breakDuration: number // 休息时长(分钟)
  autoStartBreak: boolean // 自动开始休息
  autoStartWork: boolean // 自动开始工作
}

// ==================== 设置相关 ====================
/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * 提醒时间配置
 */
export interface ReminderConfig {
  course: number // 课程提前提醒(分钟)
  task: number // 任务截止前提醒(分钟)
}

/**
 * 应用设置
 */
export interface AppSettings {
  themeMode: ThemeMode
  currentSemester: string
  reminder: ReminderConfig
  pomodoro: PomodoroConfig
  enableNotification: boolean
  enableVibration: boolean
}

// ==================== 统计数据 ====================
/**
 * 每日统计数据
 */
export interface DailyStats {
  date: string
  tasksCompleted: number
  tasksTotal: number
  focusMinutes: number
  goalsProgress: number
}

/**
 * 每周统计数据
 */
export interface WeeklyStats {
  weekStart: string
  weekEnd: string
  totalFocusMinutes: number
  tasksCompleted: number
  goalsCompleted: number
}

// ==================== GPA计算 ====================
/**
 * 成绩记录
 */
export interface Grade {
  id: string
  courseId: string
  courseName: string
  credit: number // 学分
  score: number // 成绩 (百分制)
  scoreType: 'score' | 'grade' // 百分制/等级制
  semester: string
}

// ==================== 备份数据 ====================
/**
 * 完整备份数据结构
 */
export interface BackupData {
  version: string
  exportTime: string
  courses: Course[]
  tasks: Task[]
  goals: Goal[]
  focusSessions: FocusSession[]
  assignments: Assignment[]
  grades: Grade[]
  settings: AppSettings
}

// ==================== 表单草稿 ====================
/**
 * 表单草稿
 */
export interface FormDraft {
  type: 'task' | 'course' | 'goal'
  data: any
  updateTime: string
}
