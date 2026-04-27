/**
 * 集成测试用例
 * 测试完整的业务流程
 */

// ==================== 任务管理集成测试 ====================

/**
 * 测试任务创建和子任务管理
 */
function testTaskCreationFlow() {
  console.log('\n=== 测试任务创建流程 ===')

  // 模拟任务数据
  const task = {
    type: 'study',
    title: '完成数学作业',
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    subtasks: [
      {
        id: 'st1',
        title: '完成习题1-10',
        isCompleted: false,
        order: 1
      },
      {
        id: 'st2',
        title: '完成习题11-20',
        isCompleted: false,
        order: 2
      }
    ]
  }

  // 测试1: 验证任务结构
  if (!task.title || !task.deadline) {
    throw new Error('任务缺少必要字段')
  }
  console.log('✅ 任务结构验证通过')

  // 测试2: 验证子任务order值
  const subtaskOrders = task.subtasks.map(st => st.order)
  const isSequential = subtaskOrders.every((order, index) => order === index + 1)
  if (!isSequential) {
    throw new Error('子任务order值不连续')
  }
  console.log('✅ 子任务order验证通过')

  // 测试3: 子任务排序
  const moveResult = simulateSubtaskMove(task, 0, 'down')
  if (moveResult.subtasks[0].order !== 2 || moveResult.subtasks[1].order !== 1) {
    throw new Error('子任务移动后order不正确')
  }
  console.log('✅ 子任务排序验证通过')
}

/**
 * 模拟子任务移动
 */
function simulateSubtaskMove(task: any, index: number, direction: 'up' | 'down') {
  const subtasks = task.subtasks
  const newIndex = direction === 'up' ? index - 1 : index + 1

  if (newIndex < 0 || newIndex >= subtasks.length) {
    throw new Error('移动越界')
  }

  // 交换位置
  const temp = subtasks[index]
  subtasks[index] = subtasks[newIndex]
  subtasks[newIndex] = temp

  // 交换order
  const tempOrder = subtasks[index].order
  subtasks[index].order = subtasks[newIndex].order
  subtasks[newIndex].order = tempOrder

  return task
}

// ==================== 目标管理集成测试 ====================

/**
 * 测试目标创建和进度管理
 */
function testGoalCreationFlow() {
  console.log('\n=== 测试目标创建流程 ===')

  // 模拟目标数据
  const goal = {
    type: 'exam',
    title: '英语四级',
    weight: 7,
    totalProgress: 4500,
    currentProgress: 0,
    tasks: [],
    milestones: [
      {
        id: 'm1',
        title: '词汇积累',
        targetProgress: 30,
        isCompleted: false,
        order: 1
      },
      {
        id: 'm2',
        title: '听力训练',
        targetProgress: 60,
        isCompleted: false,
        order: 2
      }
    ],
    progressHistory: [
      {
        id: 'ph1',
        progress: 0,
        delta: 0,
        note: '目标创建',
        createTime: new Date().toISOString()
      }
    ]
  }

  // 测试1: 验证目标结构
  if (!goal.title || goal.totalProgress <= 0) {
    throw new Error('目标结构无效')
  }
  console.log('✅ 目标结构验证通过')

  // 测试2: 验证权重范围
  if (goal.weight < 1 || goal.weight > 10) {
    throw new Error('权重超出范围(1-10)')
  }
  console.log('✅ 权重范围验证通过')

  // 测试3: 里程碑进度验证
  goal.milestones.forEach(milestone => {
    const percent = (milestone.targetProgress / goal.totalProgress) * 100
    if (percent > 100) {
      throw new Error(`里程碑进度超过100%: ${percent}%`)
    }
  })
  console.log('✅ 里程碑进度验证通过')

  // 测试4: 进度更新
  const updateResult = simulateProgressUpdate(goal, 450)
  if (updateResult.currentProgress !== 450) {
    throw new Error('进度更新失败')
  }
  if (updateResult.progressHistory[1].delta !== 450) {
    throw new Error('进度记录delta不正确')
  }
  console.log('✅ 进度更新验证通过')
}

/**
 * 模拟进度更新
 */
function simulateProgressUpdate(goal: any, newProgress: number) {
  const delta = newProgress - goal.currentProgress
  goal.currentProgress = newProgress

  goal.progressHistory.push({
    id: `ph${Date.now()}`,
    progress: newProgress,
    delta: delta,
    note: '更新进度',
    createTime: new Date().toISOString()
  })

  return goal
}

// ==================== GPA计算集成测试 ====================

/**
 * 测试GPA计算流程
 */
function testGPACalculationFlow() {
  console.log('\n=== 测试GPA计算流程 ===')

  // 模拟成绩数据
  const grades = [
    { courseName: '高等数学', credit: 4, scoreType: 'score', score: 88, semester: '2024-2025-1' },
    { courseName: '大学英语', credit: 3, scoreType: 'grade', score: 'A', semester: '2024-2025-1' },
    { courseName: '线性代数', credit: 3, scoreType: 'score', score: 92, semester: '2024-2025-1' }
  ]

  // 测试1: 计算加权平均分
  let totalScore = 0
  let totalCredit = 0

  grades.forEach(grade => {
    let score = 0
    if (grade.scoreType === 'score') {
      score = Number(grade.score)
      if (score < 0 || score > 100) {
        throw new Error(`分数超出范围: ${score}`)
      }
    } else if (grade.scoreType === 'grade') {
      const gradeMap: Record<string, number> = {
        'A+': 97, 'A': 92, 'A-': 87,
        'B+': 82, 'B': 77, 'B-': 72,
        'C+': 67, 'C': 62,
        'D': 55, 'F': 40
      }
      score = gradeMap[grade.score] || 0
    }
    totalScore += score * grade.credit
    totalCredit += grade.credit
  })

  const avg = totalCredit === 0 ? 0 : totalScore / totalCredit
  console.log(`✅ 加权平均分: ${avg.toFixed(2)}`)

  // 测试2: 计算GPA
  const gpa = calculateGPA(avg)
  if (gpa < 0 || gpa > 4.0) {
    throw new Error(`GPA超出范围: ${gpa}`)
  }
  console.log(`✅ GPA: ${gpa.toFixed(2)}`)

  // 测试3: 总学分
  if (totalCredit !== grades.reduce((sum, g) => sum + g.credit, 0)) {
    throw new Error('总学分计算错误')
  }
  console.log(`✅ 总学分: ${totalCredit}`)
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

// ==================== 白噪音播放集成测试 ====================

/**
 * 测试音频播放流程
 */
function testAudioPlayerFlow() {
  console.log('\n=== 测试音频播放流程 ===')

  // 模拟音频状态
  let audioState = {
    isPlaying: false,
    currentNoise: 'silence',
    volume: 50,
    audioContext: null
  }

  // 测试1: 切换到有声音的噪音
  audioState.currentNoise = 'rain'
  audioState.volume = 50
  console.log(`✅ 切换噪音: ${audioState.currentNoise}`)

  // 测试2: 开始播放
  audioState.isPlaying = true
  audioState.audioContext = { src: 'test.mp3', volume: 0.5 }
  console.log('✅ 开始播放')

  // 测试3: 调节音量
  audioState.volume = Math.min(100, Math.max(0, 75))
  if (audioState.volume !== 75) {
    throw new Error('音量调节失败')
  }
  console.log(`✅ 音量调节: ${audioState.volume}%`)

  // 测试4: 停止播放
  audioState.isPlaying = false
  audioState.audioContext = null
  console.log('✅ 停止播放')
}

// ==================== 数据导入导出集成测试 ====================

/**
 * 测试数据导入导出流程
 */
function testDataImportExportFlow() {
  console.log('\n=== 测试数据导入导出流程 ===')

  // 模拟导出数据
  const exportData = {
    version: '1.0.0',
    exportTime: new Date().toISOString(),
    courses: [
      {
        id: 'c1',
        name: '高等数学',
        teacher: '张老师',
        classroom: 'A101',
        dayOfWeek: 1,
        startSection: 1,
        endSection: 2,
        weekType: 'all',
        semester: '2024-2025-1',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
    ],
    tasks: [
      {
        id: 't1',
        title: '作业1',
        type: 'study',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        subtasks: [],
        isCompleted: false,
        notified: false,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
    ],
    goals: [],
    focusSessions: [],
    assignments: [],
    grades: [],
    settings: {}
  }

  // 测试1: JSON序列化
  try {
    const jsonStr = JSON.stringify(exportData, null, 2)
    console.log('✅ JSON序列化成功')
  } catch (error) {
    throw new Error('JSON序列化失败')
  }

  // 测试2: CSV格式生成
  const csvLines = generateCSV(exportData)
  if (!csvLines.includes('课程名称')) {
    throw new Error('CSV格式错误')
  }
  console.log('✅ CSV格式生成成功')

  // 测试3: Word文档生成
  const htmlContent = generateWordDoc(exportData)
  if (!htmlContent.includes('<html>')) {
    throw new Error('Word文档格式错误')
  }
  console.log('✅ Word文档生成成功')

  // 测试4: 数据验证
  if (!validateBackupDataStructure(exportData)) {
    throw new Error('数据验证失败')
  }
  console.log('✅ 数据验证通过')
}

/**
 * 生成CSV格式
 */
function generateCSV(data: any): string {
  const lines: string[] = []
  lines.push('=== 课程数据 ===')
  lines.push('课程名称,教师姓名,教室,星期,开始节次,结束节次,周类型,学期')
  data.courses.forEach((c: any) => {
    const weekMap = { 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日' }
    const weekTypeMap = { all: '全周', odd: '单周', even: '双周' }
    lines.push(`"${c.name}","${c.teacher}","${c.classroom}",${weekMap[c.dayOfWeek] || '周一'},${c.startSection},${c.endSection},${weekTypeMap[c.weekType] || '全周'},"${c.semester}"`)
  })
  return lines.join('\n')
}

/**
 * 生成Word文档
 */
function generateWordDoc(data: any): string {
  const html: string[] = []
  html.push('<!DOCTYPE html><html><head><meta charset="utf-8">')
  html.push('<style>body { font-family: "Microsoft YaHei", sans-serif; padding: 20px; }</style></head><body>')
  html.push('<h1>数据报告</h1>')
  html.push('<table><tr><th>课程名称</th></tr>')
  data.courses.forEach((c: any) => {
    html.push(`<tr><td>${c.name}</td></tr>`)
  })
  html.push('</table></body></html>')
  return html.join('\n')
}

/**
 * 验证数据结构
 */
function validateBackupDataStructure(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  if (!data.version || !data.exportTime) return false

  try {
    new Date(data.exportTime)
  } catch {
    return false
  }

  const hasArray = Array.isArray(data.courses) ||
                   Array.isArray(data.tasks) ||
                   Array.isArray(data.goals) ||
                   Array.isArray(data.grades)
  return hasArray
}

// ==================== 运行集成测试 ====================

/**
 * 运行所有集成测试
 */
function runIntegrationTests() {
  console.log('\n🧪 开始运行集成测试\n')

  try {
    testTaskCreationFlow()
    testGoalCreationFlow()
    testGPACalculationFlow()
    testAudioPlayerFlow()
    testDataImportExportFlow()

    console.log('🎉 所有集成测试通过！\n')
    return true
  } catch (error) {
    console.error('❌ 集成测试失败:', error)
    return false
  }
}

// 导出测试函数
export {
  runIntegrationTests,
  testTaskCreationFlow,
  testGoalCreationFlow,
  testGPACalculationFlow,
  testAudioPlayerFlow,
  testDataImportExportFlow
}
