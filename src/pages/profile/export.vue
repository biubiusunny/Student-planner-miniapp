<template>
  <view class="container">
    <!-- 导出格式选择 -->
    <view class="section">
      <text class="section-title">选择导出格式</text>
      <view class="format-selector">
        <view
          v-for="format in exportFormats"
          :key="format.value"
          :class="['format-item', { active: exportFormat === format.value }]"
          @tap="selectFormat(format.value)"
        >
          <view class="format-icon" :style="{ background: format.color }">
            <uni-icons :type="format.icon" size="24" color="#fff" />
          </view>
          <text class="format-label">{{ format.label }}</text>
          <text class="format-desc">{{ format.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 导出内容选择 -->
    <view class="section">
      <text class="section-title">选择导出内容</text>
      <view class="selection-card">
        <view class="select-all" @tap="toggleSelectAll">
          <view class="checkbox" :class="{ checked: allSelected }">
            <uni-icons v-if="allSelected" type="checkmarkempty" size="16" color="#fff" />
          </view>
          <text>全选</text>
        </view>

        <view class="option-list">
          <view
            v-for="option in exportOptions"
            :key="option.key"
            class="option-item"
            @tap="toggleOption(option.key)"
          >
            <view class="checkbox" :class="{ checked: selectedOptions.includes(option.key) }">
              <uni-icons
                v-if="selectedOptions.includes(option.key)"
                type="checkmarkempty"
                size="16"
                color="#fff"
              />
            </view>
            <view class="option-content">
              <text class="option-label">{{ option.label }}</text>
              <text class="option-count">{{ option.count }} 条</text>
            </view>
            <uni-icons :type="option.icon" size="20" :color="option.color" />
          </view>
        </view>
      </view>
    </view>

    <!-- 导出说明 -->
    <view class="section">
      <text class="section-title">导出说明</text>
      <view class="info-card">
        <view class="info-item">
          <uni-icons type="info" size="16" color="#007AFF" />
          <text>导出的文件为 JSON 格式，可随时导入恢复</text>
        </view>
        <view class="info-item">
          <uni-icons type="info" size="16" color="#007AFF" />
          <text>建议定期导出备份，防止数据丢失</text>
        </view>
        <view class="info-item">
          <uni-icons type="info" size="16" color="#007AFF" />
          <text>文件包含所选的所有数据，请妥善保管</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="action-bar">
      <view class="btn primary" @tap="handleExport">
        <text>导出数据</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  courseStorage,
  taskStorage,
  goalStorage,
  focusStorage,
  gradeStorage,
  settingsStorage
} from '@/utils/storage'
import type { BackupData } from '@/types'
import dayjs from 'dayjs'

// ==================== 数据 ====================
const exportFormat = ref<'json' | 'csv' | 'word' | 'excel'>('json')
const selectedOptions = ref<string[]>([])

const exportFormats = [
  { value: 'json' as const, label: 'JSON格式', icon: 'file', color: '#007AFF', desc: '完整备份，可恢复' },
  { value: 'csv' as const, label: 'CSV格式', icon: 'paper', color: '#34C759', desc: '兼容Excel，可编辑' },
  { value: 'word' as const, label: 'Word文档', icon: 'compose', color: '#2196F3', desc: '格式化报告' },
  { value: 'excel' as const, label: 'Excel表格', icon: 'list', color: '#4CAF50', desc: '数据表格' }
]

const exportOptions = ref([
  { key: 'courses', label: '课程数据', icon: 'calendar', color: '#007AFF', count: 0 },
  { key: 'tasks', label: '任务数据', icon: 'list', color: '#34C759', count: 0 },
  { key: 'goals', label: '目标数据', icon: 'flag', color: '#FF9500', count: 0 },
  { key: 'focusSessions', label: '专注记录', icon: 'clock', color: '#5856D6', count: 0 },
  { key: 'grades', label: 'GPA成绩', icon: 'compose', color: '#FF3B30', count: 0 },
  { key: 'settings', label: '应用设置', icon: 'gear', color: '#8E8E93', count: 1 }
])

// ==================== 计算属性 ====================
const allSelected = computed(() => {
  return exportOptions.value.every(opt => selectedOptions.value.includes(opt.key))
})

// ==================== 生命周期 ====================
onMounted(() => {
  loadDataCount()
  // 默认全选
  selectedOptions.value = exportOptions.value.map(opt => opt.key)
})

// ==================== 方法 ====================

/**
 * 加载数据数量
 */
function loadDataCount() {
  exportOptions.value = exportOptions.value.map(opt => {
    let count = 0

    switch (opt.key) {
      case 'courses':
        count = courseStorage.getAll().length
        break
      case 'tasks':
        count = taskStorage.getAll().length
        break
      case 'goals':
        count = goalStorage.getAll().length
        break
      case 'focusSessions':
        count = focusStorage.getAll().length
        break
      case 'grades':
        count = gradeStorage.getAll().length
        break
      case 'settings':
        count = 1
        break
    }

    return { ...opt, count }
  })
}

/**
 * 全选/取消全选
 */
function toggleSelectAll() {
  if (allSelected.value) {
    selectedOptions.value = []
  } else {
    selectedOptions.value = exportOptions.value.map(opt => opt.key)
  }
}

/**
 * 切换选项
 */
function toggleOption(key: string) {
  const index = selectedOptions.value.indexOf(key)
  if (index > -1) {
    selectedOptions.value.splice(index, 1)
  } else {
    selectedOptions.value.push(key)
  }
}

/**
 * 选择导出格式
 */
function selectFormat(format: 'json' | 'csv' | 'word' | 'excel') {
  exportFormat.value = format
}

/**
 * 处理导出
 */
function handleExport() {
  if (selectedOptions.value.length === 0) {
    uni.showToast({
      title: '请至少选择一项',
      icon: 'none'
    })
    return
  }

  uni.showLoading({
    title: '导出中...'
  })

  try {
    const data: BackupData = {
      version: '1.0.0',
      exportTime: new Date().toISOString(),
      courses: [],
      tasks: [],
      goals: [],
      focusSessions: [],
      assignments: [],
      grades: [],
      settings: {}
    }

    // 根据选择导出数据
    if (selectedOptions.value.includes('courses')) {
      data.courses = courseStorage.getAll()
    }
    if (selectedOptions.value.includes('tasks')) {
      data.tasks = taskStorage.getAll()
    }
    if (selectedOptions.value.includes('goals')) {
      data.goals = goalStorage.getAll()
    }
    if (selectedOptions.value.includes('focusSessions')) {
      data.focusSessions = focusStorage.getAll()
    }
    if (selectedOptions.value.includes('grades')) {
      data.grades = gradeStorage.getAll()
    }
    if (selectedOptions.value.includes('settings')) {
      data.settings = settingsStorage.get()
    }

    let content = ''
    let fileName = ''

    // 根据格式生成内容
    switch (exportFormat.value) {
      case 'json':
        content = JSON.stringify(data, null, 2)
        fileName = `planner_backup_${dayjs().format('YYYY-MM-DD_HHmmss')}.json`
        break

      case 'csv':
        content = generateCSV(data)
        fileName = `planner_data_${dayjs().format('YYYY-MM-DD')}.csv`
        break

      case 'word':
        content = generateWord(data)
        fileName = `planner_report_${dayjs().format('YYYY-MM-DD')}.doc`
        break

      case 'excel':
        content = generateExcelCSV(data)
        fileName = `planner_data_${dayjs().format('YYYY-MM-DD')}.xls`
        break
    }

    // 保存到本地文件
    const fs = uni.getFileSystemManager()
    const tempFilePath = `${wx.env.USER_DATA_PATH}/${fileName}`

    fs.writeFile({
      filePath: tempFilePath,
      data: content,
      encoding: 'utf8',
      success: () => {
        uni.hideLoading()

        // 保存到系统文件
        uni.saveFile({
          tempFilePath,
          success: (saveRes) => {
            uni.showModal({
              title: '导出成功',
              content: `文件已保存：${fileName}`,
              showCancel: false,
              success: () => {
                // 打开文件
                uni.openDocument({
                  filePath: saveRes.savedFilePath,
                  showMenu: true,
                  fileType: getFileName(fileName)
                })
              }
            })
          },
          fail: () => {
            // 备用方案：复制到剪贴板
            uni.setClipboardData({
              data: content,
              success: () => {
                uni.hideLoading()
                uni.showModal({
                  title: '导出成功',
                  content: '数据已复制到剪贴板',
                  showCancel: false
                })
              },
              fail: () => {
                uni.hideLoading()
                uni.showToast({
                  title: '导出失败',
                  icon: 'none'
                })
              }
            })
          }
        })
      },
      fail: () => {
        uni.hideLoading()
        uni.showToast({
          title: '导出失败',
          icon: 'none'
        })
      }
    })
  } catch (error) {
    uni.hideLoading()
    console.error('导出错误:', error)
    uni.showToast({
      title: '导出失败',
      icon: 'none'
    })
  }
}

/**
 * 生成CSV格式
 */
function generateCSV(data: BackupData): string {
  const lines: string[] = []

  // 课程数据
  if (data.courses?.length > 0) {
    lines.push('=== 课程数据 ===')
    lines.push('课程名称,教师姓名,教室,星期,开始节次,结束节次,周类型,学期')
    data.courses.forEach(c => {
      const weekMap = { 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日' }
      const weekTypeMap = { all: '全周', odd: '单周', even: '双周' }
      lines.push(`"${c.name}","${c.teacher}","${c.classroom}",${weekMap[c.dayOfWeek as keyof typeof weekMap]},${c.startSection},${c.endSection},${weekTypeMap[c.weekType as keyof typeof weekTypeMap]},"${c.semester}"`)
    })
    lines.push('')
  }

  // 任务数据
  if (data.tasks?.length > 0) {
    lines.push('=== 任务数据 ===')
    lines.push('任务标题,类型,截止时间,优先级,完成状态')
    data.tasks.forEach(t => {
      const typeMap = { study: '学习', life: '生活' }
      const priorityMap = { high: '高', medium: '中', low: '低' }
      lines.push(`"${t.title}",${typeMap[t.type as keyof typeof typeMap]},"${dayjs(t.deadline).format('YYYY-MM-DD HH:mm')}",${priorityMap[t.priority as keyof typeof priorityMap]},${t.isCompleted ? '已完成' : '未完成'}`)
    })
    lines.push('')
  }

  // 目标数据
  if (data.goals?.length > 0) {
    lines.push('=== 目标数据 ===')
    lines.push('目标标题,类型,总进度,当前进度,完成率')
    data.goals.forEach(g => {
      const typeMap = { semester: '学期', exam: '考试', habit: '习惯' }
      const progress = ((g.currentProgress / g.totalProgress) * 100).toFixed(1)
      lines.push(`"${g.title}",${typeMap[g.type as keyof typeof typeMap]},${g.totalProgress},${g.currentProgress},${progress}%`)
    })
    lines.push('')
  }

  // GPA成绩
  if (data.grades?.length > 0) {
    lines.push('=== GPA成绩 ===')
    lines.push('课程名称,学分,成绩类型,成绩,学期')
    data.grades.forEach(g => {
      const scoreTypeMap = { score: '百分制', grade: '等级制' }
      lines.push(`"${g.courseName}",${g.credit},${scoreTypeMap[g.scoreType]},${g.score},"${g.semester}"`)
    })
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * 生成Word格式
 */
function generateWord(data: BackupData): string {
  const html: string[] = []

  html.push('<!DOCTYPE html>')
  html.push('<html><head><meta charset="utf-8">')
  html.push('<style>')
  html.push('body { font-family: "Microsoft YaHei", sans-serif; padding: 20px; }')
  html.push('h1 { color: #007AFF; }')
  html.push('h2 { color: #333; margin-top: 30px; border-bottom: 2px solid #007AFF; padding-bottom: 10px; }')
  html.push('table { width: 100%; border-collapse: collapse; margin-top: 10px; }')
  html.push('th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }')
  html.push('th { background: #f5f5f5; font-weight: bold; }')
  html.push('.summary { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }')
  html.push('</style></head><body>')
  html.push(`<h1>大学生规划数据报告</h1>`)
  html.push(`<p>导出时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}</p>`)

  // 数据汇总
  html.push('<div class="summary">')
  html.push('<h3>数据统计</h3>')
  html.push(`<p>课程：${data.courses?.length || 0} 门</p>`)
  html.push(`<p>任务：${data.tasks?.length || 0} 个</p>`)
  html.push(`<p>目标：${data.goals?.length || 0} 个</p>`)
  html.push(`<p>专注记录：${data.focusSessions?.length || 0} 次</p>`)
  html.push(`<p>GPA成绩：${data.grades?.length || 0} 条</p>`)
  html.push('</div>')

  // 课程表格
  if (data.courses?.length > 0) {
    html.push('<h2>课程列表</h2>')
    html.push('<table><tr><th>课程名称</th><th>教师</th><th>教室</th><th>星期</th><th>节次</th></tr>')
    const weekMap = { 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日' }
    data.courses.forEach(c => {
      html.push(`<tr><td>${c.name}</td><td>${c.teacher}</td><td>${c.classroom}</td><td>${weekMap[c.dayOfWeek as keyof typeof weekMap]}</td><td>${c.startSection}-${c.endSection}</td></tr>`)
    })
    html.push('</table>')
  }

  // 任务表格
  if (data.tasks?.length > 0) {
    html.push('<h2>任务列表</h2>')
    html.push('<table><tr><th>任务标题</th><th>类型</th><th>截止时间</th><th>优先级</th><th>状态</th></tr>')
    const typeMap = { study: '学习', life: '生活' }
    const priorityMap = { high: '高', medium: '中', low: '低' }
    data.tasks.forEach(t => {
      html.push(`<tr><td>${t.title}</td><td>${typeMap[t.type as keyof typeof typeMap]}</td><td>${dayjs(t.deadline).format('YYYY-MM-DD HH:mm')}</td><td>${priorityMap[t.priority as keyof typeof priorityMap]}</td><td>${t.isCompleted ? '已完成' : '未完成'}</td></tr>`)
    })
    html.push('</table>')
  }

  // 目标表格
  if (data.goals?.length > 0) {
    html.push('<h2>目标列表</h2>')
    html.push('<table><tr><th>目标标题</th><th>类型</th><th>总进度</th><th>当前进度</th><th>完成率</th></tr>')
    const typeMap = { semester: '学期', exam: '考试', habit: '习惯' }
    data.goals.forEach(g => {
      const progress = ((g.currentProgress / g.totalProgress) * 100).toFixed(1)
      html.push(`<tr><td>${g.title}</td><td>${typeMap[g.type as keyof typeof typeMap]}</td><td>${g.totalProgress}</td><td>${g.currentProgress}</td><td>${progress}%</td></tr>`)
    })
    html.push('</table>')
  }

  // GPA成绩表格
  if (data.grades?.length > 0) {
    html.push('<h2>GPA成绩</h2>')
    html.push('<table><tr><th>课程名称</th><th>学分</th><th>成绩类型</th><th>成绩</th><th>学期</th></tr>')
    const scoreTypeMap = { score: '百分制', grade: '等级制' }
    data.grades.forEach(g => {
      html.push(`<tr><td>${g.courseName}</td><td>${g.credit}</td><td>${scoreTypeMap[g.scoreType]}</td><td>${g.score}</td><td>${g.semester}</td></tr>`)
    })
    html.push('</table>')
  }

  html.push('</body></html>')

  return html.join('\n')
}

/**
 * 生成Excel兼容格式（多sheet CSV）
 */
function generateExcelCSV(data: BackupData): string {
  const sheets: string[] = []

  // 课程Sheet
  if (data.courses?.length > 0) {
    sheets.push('=== Sheet: 课程 ===')
    const weekMap = { 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日' }
    const weekTypeMap = { all: '全周', odd: '单周', even: '双周' }
    sheets.push('课程名称\t教师姓名\t教室\t星期\t开始节次\t结束节次\t周类型\t学期')
    data.courses.forEach(c => {
      sheets.push(`${c.name}\t${c.teacher}\t${c.classroom}\t${weekMap[c.dayOfWeek as keyof typeof weekMap]}\t${c.startSection}\t${c.endSection}\t${weekTypeMap[c.weekType as keyof typeof weekTypeMap]}\t${c.semester}`)
    })
    sheets.push('')
  }

  // 任务Sheet
  if (data.tasks?.length > 0) {
    sheets.push('=== Sheet: 任务 ===')
    const typeMap = { study: '学习', life: '生活' }
    const priorityMap = { high: '高', medium: '中', low: '低' }
    sheets.push('任务标题\t类型\t截止时间\t优先级\t完成状态')
    data.tasks.forEach(t => {
      sheets.push(`${t.title}\t${typeMap[t.type as keyof typeof typeMap]}\t${dayjs(t.deadline).format('YYYY-MM-DD HH:mm')}\t${priorityMap[t.priority as keyof typeof priorityMap]}\t${t.isCompleted ? '已完成' : '未完成'}`)
    })
    sheets.push('')
  }

  // 目标Sheet
  if (data.goals?.length > 0) {
    sheets.push('=== Sheet: 目标 ===')
    const typeMap = { semester: '学期', exam: '考试', habit: '习惯' }
    sheets.push('目标标题\t类型\t总进度\t当前进度\t完成率')
    data.goals.forEach(g => {
      const progress = ((g.currentProgress / g.totalProgress) * 100).toFixed(1)
      sheets.push(`${g.title}\t${typeMap[g.type as keyof typeof typeMap]}\t${g.totalProgress}\t${g.currentProgress}\t${progress}%`)
    })
    sheets.push('')
  }

  // GPA成绩Sheet
  if (data.grades?.length > 0) {
    sheets.push('=== Sheet: GPA成绩 ===')
    const scoreTypeMap = { score: '百分制', grade: '等级制' }
    sheets.push('课程名称\t学分\t成绩类型\t成绩\t学期')
    data.grades.forEach(g => {
      sheets.push(`${g.courseName}\t${g.credit}\t${scoreTypeMap[g.scoreType]}\t${g.score}\t${g.semester}`)
    })
    sheets.push('')
  }

  return sheets.join('\n')
}

/**
 * 获取文件扩展名
 */
function getFileName(fileName: string): string {
  const ext = fileName.split('.').pop()
  return ext || 'json'
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.section {
  margin: 16rpx;
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

.format-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
}

.format-item {
  padding: 24rpx 16rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.format-item.active {
  background: #f0f8ff;
  border-color: #007AFF;
}

.format-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.format-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.format-desc {
  font-size: 22rpx;
  color: #999;
}

.selection-card {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #e0e0e0;
  margin-bottom: 16rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border-radius: 6rpx;
  border: 2rpx solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.2s;
}

.checkbox.checked {
  background: #007AFF;
  border-color: #007AFF;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: #fff;
  border-radius: 8rpx;
  transition: all 0.2s;
}

.option-item:active {
  background: #f0f0f0;
}

.option-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-label {
  font-size: 28rpx;
  color: #333;
}

.option-count {
  font-size: 24rpx;
  color: #999;
}

.info-card {
  background: #f9f9f9;
  border-radius: 8rpx;
  padding: 16rpx;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 12rpx 0;
}

.info-item:last-child {
  padding-bottom: 0;
}

.info-item text {
  flex: 1;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.btn {
  width: 100%;
  padding: 24rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: bold;
}

.btn.primary {
  background: #007AFF;
  color: #fff;
}
</style>
