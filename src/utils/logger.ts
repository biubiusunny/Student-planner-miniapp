/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

/**
 * 日志颜色配置
 */
const LOG_COLORS = {
  [LogLevel.DEBUG]: '#999999',
  [LogLevel.INFO]: '#007AFF',
  [LogLevel.WARN]: '#FF9500',
  [LogLevel.ERROR]: '#FF3B30',
  [LogLevel.FATAL]: '#FF2D55'
}

/**
 * 日志标签
 */
const LOG_LABELS = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL'
}

/**
 * 日志条目
 */
export interface LogEntry {
  timestamp: string
  level: LogLevel
  levelLabel: string
  message: string
  module: string
  extra?: any
}

/**
 * 日志配置
 */
interface LogConfig {
  minLevel: LogLevel
  enableConsole: boolean
  enableStorage: boolean
  maxStorageSize: number
  enableTimestamp: boolean
  maxStorageEntries: number
}

/**
 * 日志管理器
 */
export class LogManager {
  private static instance: LogManager | null = null
  private config: LogConfig = {
    minLevel: LogLevel.INFO,
    enableConsole: true,
    enableStorage: true,
    maxStorageSize: 1024 * 1024, // 1MB
    enableTimestamp: true,
    maxStorageEntries: 500
  }

  private logs: LogEntry[] = []
  private storageKey = 'app_logs'

  private constructor() {
    this.loadLogs()
  }

  /**
   * 获取单例实例
   */
  static getInstance(): LogManager {
    if (!LogManager.instance) {
      LogManager.instance = new LogManager()
    }
    return LogManager.instance
  }

  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string, module: string, extra?: any) {
    // 检查日志级别
    if (level < this.config.minLevel) {
      return
    }

    const entry: LogEntry = {
      timestamp: this.config.enableTimestamp ? new Date().toISOString() : '',
      level,
      levelLabel: LOG_LABELS[level],
      message,
      module,
      extra
    }

    // 添加到内存日志
    this.logs.push(entry)

    // 控制内存中的日志数量
    if (this.logs.length > this.config.maxStorageEntries) {
      this.logs.shift() // 移除最早的日志
    }

    // 输出到控制台
    if (this.config.enableConsole) {
      this.logToConsole(entry)
    }

    // 保存到存储
    if (this.config.enableStorage) {
      this.saveLogs()
    }
  }

  /**
   * 输出到控制台
   */
  private logToConsole(entry: LogEntry) {
    const color = LOG_COLORS[entry.level]
    const prefix = `[${entry.levelLabel}]`

    if (entry.extra) {
      console.log(`%c${prefix} ${color}`, entry.message, entry.extra)
    } else {
      console.log(`%c${prefix} ${color}`, entry.message)
    }
  }

  /**
   * 保存到存储
   */
  private saveLogs() {
    try {
      const data = JSON.stringify(this.logs)
      uni.setStorageSync(this.storageKey, data)
    } catch (error) {
      console.error('保存日志失败:', error)
    }
  }

  /**
   * 从存储加载日志
   */
  private loadLogs() {
    try {
      const data = uni.getStorageSync(this.storageKey)
      if (data) {
        this.logs = JSON.parse(data)
      }
    } catch (error) {
      console.error('加载日志失败:', error)
      this.logs = []
    }
  }

  /**
   * 清理旧日志
   */
  clearOldLogs(keepDays: number = 7): void {
    const now = new Date()
    const cutoff = new Date(now.getTime() - keepDays * 24 * 60 * 60 * 1000)

    this.logs = this.logs.filter(log => {
      if (!log.timestamp) return false
      const logTime = new Date(log.timestamp)
      return logTime >= cutoff
    })

    this.saveLogs()
  }

  /**
   * 清空所有日志
   */
  clearAllLogs(): void {
    this.logs = []
    this.saveLogs()
  }

  /**
   * 获取所有日志
   */
  getAllLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * 按级别过滤日志
   */
  getLogsByLevel(minLevel: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level >= minLevel)
  }

  /**
   * 按模块过滤日志
   */
  getLogsByModule(module: string): LogEntry[] {
    return this.logs.filter(log => log.module === module)
  }

  /**
   * 获取错误日志
   */
  getErrorLogs(): LogEntry[] {
    return this.getLogsByLevel(LogLevel.ERROR)
  }

  /**
   * 搜索日志
   */
  searchLogs(keyword: string): LogEntry[] {
    const lowerKeyword = keyword.toLowerCase()
    return this.logs.filter(log => {
      const message = log.message.toLowerCase()
      return message.includes(lowerKeyword) ||
             log.module.toLowerCase().includes(lowerKeyword) ||
             (log.extra && JSON.stringify(log.extra).toLowerCase().includes(lowerKeyword))
    })
  }

  /**
   * 获取日志摘要
   */
  getLogSummary(): {
    return {
      total: this.logs.length,
      debug: this.logs.filter(l => l.level === LogLevel.DEBUG).length,
      info: this.logs.filter(l => l.level === LogLevel.INFO).length,
      warn: this.logs.filter(l => l.level === LogLevel.WARN).length,
      error: this.logs.filter(l => l.level === LogLevel.ERROR).length,
      fatal: this.logs.filter(l => l.level === LogLevel.FATAL).length
    }
  }

  /**
   * 导出日志
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * 设置日志级别
   */
  setMinLevel(level: LogLevel): void {
    this.config.minLevel = level
    this.log(LogLevel.INFO, `日志级别设置为: ${LOG_LABELS[level]}`, 'LogManager')
  }

  /**
   * 启用/禁用控制台输出
   */
  setConsoleOutput(enabled: boolean): void {
    this.config.enableConsole = enabled
    this.log(LogLevel.INFO, `控制台输出: ${enabled ? '启用' : '禁用'}`, 'LogManager')
  }

  /**
   * 启用/禁用存储
   */
  setStorageEnabled(enabled: boolean): void {
    this.config.enableStorage = enabled
    this.log(LogLevel.INFO, `存储: ${enabled ? '启用' : '禁用'}`, 'LogManager')
  }

  /**
   * 设置最大存储条数
   */
  setMaxEntries(count: number): void {
    this.config.maxStorageEntries = count
    this.log(LogLevel.INFO, `最大存储条数: ${count}`, 'LogManager')
  }
}

// ==================== 便捷函数 ====================

const logger = LogManager.getInstance()

/**
 * DEBUG级别日志
 */
export function debug(message: string, module: string = 'app', extra?: any): void {
  logger.log(LogLevel.DEBUG, message, module, extra)
}

/**
 * INFO级别日志
 */
export function info(message: string, module: string = 'app', extra?: any): void {
  logger.log(LogLevel.INFO, message, module, extra)
}

/**
 * WARN级别日志
 */
export function warn(message: string, module: string = 'app', extra?: any): void {
  logger.log(LogLevel.WARN, message, module, extra)
}

/**
 * ERROR级别日志
 */
export function error(message: string, module: string = 'app', extra?: any): void {
  logger.log(LogLevel.ERROR, message, module, extra)
}

/**
 * FATAL级别日志
 */
export function fatal(message: string, module: string = 'app', extra?: any): void {
  logger.log(LogLevel.FATAL, message, module, extra)
}

/**
 * 性能日志
 */
export function perf(message: string, module: string = 'app', extra?: any): void {
  logger.log(LogLevel.DEBUG, message, module, {
    ...extra,
    __perf: true
  })
}

/**
 * 开始计时（性能测量）
 */
const perfTimers: Record<string, number> = {}

export function startPerf(label: string): void {
  perfTimers[label] = Date.now()
}

export function endPerf(label: string, module: string = 'app'): void {
  const startTime = perfTimers[label]
  if (!startTime) return

  const elapsed = Date.now() - startTime
  perf(`性能: ${label} 耗时 ${elapsed}ms`, module)

  delete perfTimers[label]
}

// ==================== 工具函数 ====================

/**
 * 清理旧日志
 */
export function clearOldLogs(days: number = 7): void {
  logger.clearOldLogs(days)
}

/**
 * 清空所有日志
 */
export function clearAllLogs(): void {
  logger.clearAllLogs()
}

/**
 * 获取日志摘要
 */
export function getLogSummary() {
  return logger.getLogSummary()
}

/**
 * 导出日志
 */
export function exportLogs(): string {
  return logger.exportLogs()
}

/**
 * 设置日志级别
 */
export function setLogLevel(level: string): void {
  const levelMap: Record<string, LogLevel> = {
    'debug': LogLevel.DEBUG,
    'info': LogLevel.INFO,
    'warn': LogLevel.WARN,
    'error': LogLevel.ERROR,
    'fatal': LogLevel.FATAL
  }
  const level = levelMap[level.toLowerCase()] || LogLevel.INFO
  logger.setMinLevel(level)
}

/**
 * 搜索日志
 */
export function searchLogs(keyword: string): LogEntry[] {
  return logger.searchLogs(keyword)
}

/**
 * 获取所有日志
 */
export function getAllLogs(): LogEntry[] {
  return logger.getAllLogs()
}

/**
 * 获取错误日志
 */
export function getErrorLogs(): LogEntry[] {
  return logger.getErrorLogs()
}
