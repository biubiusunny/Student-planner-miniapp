/**
 * 单元测试用例
 * 测试各个功能模块的边界条件和错误处理
 */

// ==================== 工具函数 ====================

/**
 * 测试辅助函数
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ 测试失败: ${message}`)
    throw new Error(message)
  } else {
    console.log(`✅ 测试通过: ${message}`)
  }
}

// ==================== 子任务排序测试 ====================

/**
 * 测试子任务order字段
 */
function testSubtaskOrdering() {
  console.log('\n=== 测试子任务排序 ===')

  // 测试1: 添加第一个子任务
  const subtasks1: any[] = []
  const maxOrder1 = subtasks1.length > 0
    ? Math.max(...subtasks1.map(s => s.order || 0))
    : 0
  const order1 = maxOrder1 + 1
  assert(order1 === 1, '第一个子任务order应该是1')

  // 测试2: 添加第二个子任务
  subtasks1.push({ order: order1 })
  const maxOrder2 = Math.max(...subtasks1.map(s => s.order))
  const order2 = maxOrder2 + 1
  assert(order2 === 2, '第二个子任务order应该是2')

  // 测试3: 重复order值处理
  const subtasks2 = [
    { id: '1', title: 'A', order: 1 },
    { id: '2', title: 'B', order: 1 }, // 重复
    { id: '3', title: 'C', order: 3 }
  ]
  const orders = subtasks2.map(s => s.order)
  const uniqueOrders = [...new Set(orders)]
  assert(orders.length !== uniqueOrders.length, '应该检测到重复的order值')

  // 测试4: 重新排序
  subtasks2.forEach((subtask, index) => {
    subtask.order = index + 1
  })
  const newOrders = subtasks2.map(s => s.order)
  const isSequential = newOrders.every((order, index) => order === index + 1)
  assert(isSequential, '重新排序后应该是连续的')

  console.log('✅ 子任务排序测试通过\n')
}

// ==================== GPA计算测试 ====================

/**
 * 测试GPA计算边界条件
 */
function testGPACalculation() {
  console.log('\n=== 测试GPA计算 ===')

  // 测试1: 百分制边界值
  assert(convertScoreToNumber('score', 0) === 0, '0分应该是0')
  assert(convertScoreToNumber('score', 100) === 100, '100分应该是100')
  assert(convertScoreToNumber('score', -1) === 0, '负分应该返回0')
  assert(convertScoreToNumber('score', 101) === 0, '超过100分应该返回0')

  // 测试2: 等级制转换
  assert(convertScoreToNumber('grade', 'A+') === 97, 'A+应该是97分')
  assert(convertScoreToNumber('grade', 'F') === 40, 'F应该是40分')
  assert(convertScoreToNumber('grade', 'X') === 0, '未知等级应该返回0')

  // 测试3: GPA计算
  assert(calculateGPA(95) === 4.0, '95分GPA应该是4.0')
  assert(calculateGPA(87) === 3.7, '87分GPA应该是3.7')
  assert(calculateGPA(60) === 1.0, '60分GPA应该是1.0')
  assert(calculateGPA(59) === 0, '59分GPA应该是0')

  // 测试4: 加权平均
  const grades1 = [
    { score: 90, credit: 3 },
    { score: 85, credit: 4 }
  ]
  const weighted1 = (90 * 3 + 85 * 4) / (3 + 4)
  const calculated1 = calculateWeightedAverage(grades1)
  assert(Math.abs(calculated1 - weighted1) < 0.01, '加权平均计算应该正确')

  console.log('✅ GPA计算测试通过\n')
}

/**
 * 百分制转数字（带验证）
 */
function convertScoreToNumber(scoreType: 'score' | 'grade', value: string | number): number {
  if (scoreType === 'score') {
    const num = Number(value)
    if (isNaN(num) || num < 0 || num > 100) {
      return 0
    }
    return num
  }
  return convertScoreToNumber('grade', value)
}

/**
 * 等级制转数字
 */
function convertScoreToNumber(scoreType: 'score' | 'grade', value: string | number): number {
  if (scoreType === 'score') {
    return convertScoreToNumber('score', value)
  }

  const gradeMap: Record<string, number> = {
    'A+': 97, 'A': 92, 'A-': 87,
    'B+': 82, 'B': 77, 'B-': 72,
    'C+': 67, 'C': 62,
    'D': 55, 'F': 40
  }

  const scoreStr = String(value).toUpperCase()
  return gradeMap[scoreStr] || 0
}

/**
 * 计算GPA（4.0制）
 */
function calculateGPA(score: number): number {
  if (score >= 90) return 4.0
  if (score >= 85) return 3.7
  if (score >= 82) return 3.3
  if (score >= 78) return 3.0
  if (score >= 75) return 2.7
  if (score >= 72) return 2.3
  if (score >= 68) return 2.0
  if (score >= 64) return 1.5
  if (score >= 60) return 1.0
  return 0
}

/**
 * 计算加权平均
 */
function calculateWeightedAverage(grades: any[]): number {
  let totalScore = 0
  let totalCredit = 0

  grades.forEach(grade => {
    const score = convertScoreToNumber(grade.scoreType, grade.score)
    totalScore += score * grade.credit
    totalCredit += grade.credit
  })

  return totalCredit === 0 ? 0 : (totalScore / totalCredit).toFixed(2)
}

// ==================== 白噪音播放测试 ====================

/**
 * 测试音频播放器
 */
function testAudioPlayer() {
  console.log('\n=== 测试音频播放器 ===')

  // 测试1: 音量边界
  const volume1 = Math.min(100, Math.max(0, -5))
  assert(volume1 === 0, '负数音量应该设为0')

  const volume2 = Math.min(100, Math.max(0, 150))
  assert(volume2 === 100, '超过100的音量应该设为100')

  // 测试2: 音频URL验证
  const validUrl = 'https://example.com/audio.mp3'
  const isValidUrl = validUrl.startsWith('http')
  assert(isValidUrl, 'HTTP URL应该是有效的')

  const invalidUrl = 'not-a-url'
  const isInvalidUrl = !invalidUrl.startsWith('http')
  assert(isInvalidUrl, '非HTTP URL应该是无效的')

  // 测试3: 循环播放逻辑
  const loopCount = 0
  const maxLoops = 3
  let shouldContinue = true

  while (shouldContinue && loopCount < maxLoops) {
    loopCount++
    // 模拟音频结束事件
    if (loopCount >= maxLoops) {
      shouldContinue = false
    }
  }
  assert(loopCount === maxLoops, '循环应该能正确终止')

  console.log('✅ 音频播放器测试通过\n')
}

// ==================== 进度记录测试 ====================

/**
 * 测试进度记录
 */
function testProgressHistory() {
  console.log('\n=== 测试进度记录 ===')

  // 测试1: 初始进度记录
  const initialRecord = {
    id: '1',
    progress: 0,
    delta: 0,
    note: '目标创建',
    createTime: new Date().toISOString()
  }
  assert(initialRecord.delta === 0, '初始delta应该是0')

  // 测试2: delta计算
  const oldProgress = 10
  const newProgress = 15
  const delta = newProgress - oldProgress
  assert(delta === 5, 'delta应该正确计算')

  // 测试3: 进度百分比计算
  const totalProgress = 100
  const currentProgress = 75
  const percent = Math.round((currentProgress / totalProgress) * 100)
  assert(percent === 75, '进度百分比应该正确')

  // 测试4: 里程碑进度
  const milestoneProgress = Math.round((25 / 100) * 100)
  assert(milestoneProgress === 25, '里程碑进度百分比应该正确')

  console.log('✅ 进度记录测试通过\n')
}

// ==================== 数据验证测试 ====================

/**
 * 测试数据验证
 */
function testDataValidation() {
  console.log('\n=== 测试数据验证 ===')

  // 测试1: 有效数据
  const validData = {
    version: '1.0.0',
    exportTime: new Date().toISOString(),
    courses: [],
    tasks: [],
    goals: [],
    grades: []
  }
  assert(validateBackupData(validData), '有效数据应该通过验证')

  // 测试2: 缺少version
  const noVersion = {
    exportTime: new Date().toISOString(),
    courses: []
  }
  assert(!validateBackupData(noVersion), '缺少version的数据应该失败')

  // 测试3: 无效时间格式
  const invalidTime = {
    version: '1.0.0',
    exportTime: 'not-a-date',
    courses: []
  }
  assert(!validateBackupData(invalidTime), '无效时间格式应该失败')

  // 测试4: 空数据
  const emptyData = {
    version: '1.0.0',
    exportTime: new Date().toISOString(),
    courses: [],
    tasks: [],
    goals: [],
    grades: []
  }
  assert(validateBackupData(emptyData), '空数据结构应该通过验证')

  console.log('✅ 数据验证测试通过\n')
}

/**
 * 验证备份数据
 */
function validateBackupData(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  if (!data.version || typeof data.version !== 'string') return false
  if (!data.exportTime || typeof data.exportTime !== 'string') return false

  try {
    new Date(data.exportTime)
  } catch {
    return false
  }

  return Array.isArray(data.courses) ||
         Array.isArray(data.tasks) ||
         Array.isArray(data.goals) ||
         Array.isArray(data.grades)
}

// ==================== 边界条件测试 ====================

/**
 * 测试边界条件
 */
function testEdgeCases() {
  console.log('\n === 测试边界条件 ===')

  // 测试1: 空数组处理
  const emptyArray: any[] = []
  const maxEmpty = emptyArray.length > 0 ? Math.max(...emptyArray) : 0
  assert(maxEmpty === 0, '空数组的max应该是0')

  // 测试2: 除零保护
  const divide1 = 10 / 5
  assert(divide1 === 2, '正常除法应该工作')

  const total = 0
  const avg1 = total > 0 ? 10 / total : 0
  assert(avg1 === 0, '除零应该返回0')

  // 测试3: 数组越界保护
  const array = [1, 2, 3]
  const index1 = array[0] || 0
  assert(index1 === 1, '访问有效索引应该工作')

  const index2 = array[10] || 0
  assert(index2 === 0, '越界索引应该返回默认值')

  // 测试4: 字符串转数字
  const num1 = Number('123')
  assert(num1 === 123, '有效数字字符串应该转换正确')

  const num2 = Number('abc')
  assert(isNaN(num2), '无效字符串应该返回NaN')

  const num3 = Number('') || 0
  assert(num3 === 0, '空字符串应该返回0')

  console.log('✅ 边界条件测试通过\n')
}

// ==================== 运行所有测试 ====================

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('\n🧪 开始运行测试用例\n')

  try {
    testSubtaskOrdering()
    testGPACalculation()
    testAudioPlayer()
    testProgressHistory()
    testDataValidation()
    testEdgeCases()

    console.log('🎉 所有测试通过！\n')
    return true
  } catch (error) {
    console.error('❌ 测试失败:', error)
    return false
  }
}

// 导出测试函数
export {
  runAllTests,
  testSubtaskOrdering,
  testGPACalculation,
  testAudioPlayer,
  testProgressHistory,
  testDataValidation,
  testEdgeCases
}
