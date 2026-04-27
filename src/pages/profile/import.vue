<template>
  <view class="container">
    <!-- 上传区域 -->
    <view v-if="!hasFile" class="upload-section">
      <view class="upload-card" @tap="selectFile">
        <uni-icons type="cloud-download" size="64" color="#007AFF" />
        <text class="upload-hint">点击选择备份文件</text>
        <text class="upload-desc">支持 JSON 格式备份文件</text>
      </view>
    </view>

    <!-- 文件信息 -->
    <view v-else class="file-info-section">
      <view class="file-info-card">
        <uni-icons type="file-text" size="48" color="#34C759" />
        <view class="file-details">
          <text class="file-name">{{ fileName }}</text>
          <text class="file-meta">{{ fileSize }} · {{ exportTime }}</text>
        </view>
        <view class="file-actions">
          <view class="action-btn" @tap="clearFile">
            <uni-icons type="close" size="20" color="#ff3b30" />
          </view>
        </view>
      </view>
    </view>

    <!-- 数据预览 -->
    <view v-if="previewData" class="section">
      <text class="section-title">数据预览</text>
      <view class="preview-list">
        <view
          v-for="item in previewItems"
          :key="item.key"
          class="preview-item"
        >
          <uni-icons :type="item.icon" size="20" :color="item.color" />
          <text class="item-label">{{ item.label }}</text>
          <view class="item-count">
            <text>{{ item.count }} 条</text>
          </view>
          <uni-icons
            :type="item.selected ? 'checkmarkempty' : 'circle'"
            size="20"
            :color="item.selected ? '#34C759' : '#ccc'"
            @tap="toggleImportItem(item.key)"
          />
        </view>
      </view>
    </view>

    <!-- 导入设置 -->
    <view v-if="previewData" class="section">
      <text class="section-title">导入方式</text>
      <view class="import-mode-selector">
        <view
          v-for="mode in importModes"
          :key="mode.value"
          :class="['mode-item', { active: importMode === mode.value }]"
          @tap="selectImportMode(mode.value)"
        >
          <text class="mode-title">{{ mode.title }}</text>
          <text class="mode-desc">{{ mode.desc }}</text>
        </view>
      </view>

      <view v-if="importMode === 'merge'" class="merge-warning">
        <uni-icons type="info" size="18" color="#ff9500" />
        <text>合并模式：相同ID的数据将被覆盖，其他数据保留</text>
      </view>
    </view>

    <!-- 导入进度 -->
    <view v-if="isImporting" class="progress-section">
      <text class="progress-text">{{ importProgressText }}</text>
      <progress
        :percent="importProgress"
        active-color="#007AFF"
        backgroundColor="#f0f0f0"
        stroke-width="8"
      />
    </view>

    <!-- 导入结果 -->
    <view v-if="importResult" class="result-section">
      <view class="result-card" :class="importResult.success ? 'success' : 'error'">
        <uni-icons
          :type="importResult.success ? 'checkmarkempty' : 'closeempty'"
          size="48"
          :color="importResult.success ? '#34C759' : '#ff3b30'"
        />
        <text class="result-title">{{ importResult.success ? '导入成功' : '导入失败' }}</text>
        <text class="result-message">{{ importResult.message }}</text>
        <view v-if="importResult.details" class="result-details">
          <text v-for="(detail, index) in importResult.details" :key="index" class="detail-item">
            • {{ detail }}
          </text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view v-if="previewData && !isImporting && !importResult" class="action-bar">
      <view class="btn cancel" @tap="goBack">
        <text>取消</text>
      </view>
      <view class="btn primary" @tap="startImport">
        <text>开始导入</text>
      </view>
    </view>

    <!-- 重新导入按钮 -->
    <view v-if="importResult" class="action-bar">
      <view class="btn primary" @tap="resetImport">
        <text>重新导入</text>
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
import { generateId } from '@/utils'

// ==================== 数据 ====================
const filePath = ref('')
const fileName = ref('')
const fileSize = ref('')
const exportTime = ref('')
const fileType = ref<'json' | 'csv' | 'doc' | 'xls'>('json')
const previewData = ref<BackupData | null>(null)
const importMode = ref<'overwrite' | 'merge'>('overwrite')
const isImporting = ref(false)
const importProgress = ref(0)
const importProgressText = ref('')
const importResult = ref<{ success: boolean; message: string; details?: string[] } | null>(null)

const selectedImportItems = ref<string[]>([
  'courses',
  'tasks',
  'goals',
  'focusSessions',
  'grades',
  'settings'
])

const importModes = [
  {
    value: 'overwrite' as const,
    title: '覆盖导入',
    desc: '清空现有数据，完全恢复备份'
  },
  {
    value: 'merge' as const,
    title: '合并导入',
    desc: '保留现有数据，合并备份数据'
  }
]

// ==================== 计算属性 ====================
const hasFile = computed(() => !!filePath.value)

const previewItems = computed(() => {
  if (!previewData.value) return []

  return [
    { key: 'courses', label: '课程数据', icon: 'calendar', color: '#007AFF', count: previewData.value.courses?.length || 0 },
    { key: 'tasks', label: '任务数据', icon: 'list', color: '#34C759', count: previewData.value.tasks?.length || 0 },
    { key: 'goals', label: '目标数据', icon: 'flag', color: '#FF9500', count: previewData.value.goals?.length || 0 },
    { key: 'focusSessions', label: '专注记录', icon: 'clock', color: '#5856D6', count: previewData.value.focusSessions?.length || 0 },
    { key: 'grades', label: 'GPA成绩', icon: 'compose', color: '#FF3B30', count: previewData.value.grades?.length || 0 },
    { key: 'settings', label: '应用设置', icon: 'gear', color: '#8E8E93', count: 1 }
  ]
})

// ==================== 生命周期 ====================
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  if (currentPage?.options?.filePath) {
    loadFile(currentPage.options.filePath)
  }
})

// ==================== 方法 ====================

/**
 * 选择文件
 */
function selectFile() {
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['json', 'csv', 'doc', 'docx', 'xls', 'xlsx'],
    success: (res) => {
      loadFile(res.tempFiles[0].path)
    }
  })
}

/**
 * 加载文件
 */
function loadFile(path: string) {
  uni.showLoading({
    title: '加载中...'
  })

  const fs = uni.getFileSystemManager()

  fs.getFileInfo({
    path,
    success: (info) => {
      // 检测文件类型
      const ext = path.split('.').pop()?.toLowerCase() || ''
      const fileTypeMap: Record<string, 'json' | 'csv' | 'doc' | 'xls'> = {
        'json': 'json',
        'csv': 'csv',
        'doc': 'doc',
        'docx': 'doc',
        'xls': 'xls',
        'xlsx': 'xls'
      }
      fileType.value = fileTypeMap[ext] || 'json'

      fs.readFile({
        path,
        encoding: 'utf8',
        success: async (res) => {
          uni.hideLoading()

          try {
            let data: BackupData | null = null

            // 根据文件类型解析
            switch (fileType.value) {
              case 'json':
                data = parseJSON(res.data as string)
                break
              case 'csv':
                data = parseCSV(res.data as string)
                break
              case 'doc':
                data = parseWord(res.data as string)
                break
              case 'xls':
                data = parseExcelCSV(res.data as string)
                break
            }

            if (!data) {
              uni.showToast({
                title: '文件格式不正确',
                icon: 'none'
              })
              return
            }

            filePath.value = path
            fileName.value = path.split('/').pop() || 'backup.json'
            fileSize.value = formatFileSize(info.size)
            exportTime.value = formatTime(data.exportTime || new Date().toISOString())
            previewData.value = data

          } catch (error) {
            uni.hideLoading()
            console.error('解析失败:', error)
            uni.showToast({
              title: '文件解析失败',
              icon: 'none'
            })
          }
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({
            title: '文件读取失败',
            icon: 'none'
          })
        }
      })
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({
        title: '文件信息获取失败',
        icon: 'none'
      })
    }
  })
}

/**
 * 验证数据格式
 */
function validateData(data: any): data is BackupData {
  if (!data || typeof data !== 'object') {
    console.error('数据格式错误：不是对象')
    return false
  }

  if (!data.version || typeof data.version !== 'string') {
    console.error('数据格式错误：缺少version')
    return false
  }

  if (!data.exportTime || typeof data.exportTime !== 'string') {
    console.error('数据格式错误：缺少exportTime')
    return false
  }

  // 验证时间格式
  try {
    const exportTime = new Date(data.exportTime)
    if (isNaN(exportTime.getTime())) {
      console.error('数据格式错误：exportTime不是有效日期')
      return false
    }
  } catch (error) {
    console.error('数据格式错误：exportTime解析失败', error)
    return false
  }

  // 验证至少有一个数据数组
  const hasData = Array.isArray(data.courses) ||
                  Array.isArray(data.tasks) ||
                  Array.isArray(data.goals) ||
                  Array.isArray(data.grades)

  if (!hasData) {
    console.error('数据格式错误：缺少数据数组')
    return false
  }

  return true
}

/**
 * 解析JSON格式
 */
function parseJSON(content: string): BackupData | null {
  try {
    const data = JSON.parse(content)
    if (validateData(data)) {
      return data
    }
  } catch (error) {
    console.error('JSON解析失败:', error)
  }
  return null
}

/**
 * 解析CSV格式
 */
function parseCSV(content: string): BackupData | null {
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

    const lines = content.split('\n').filter(line => line.trim())
    let currentSection = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // 检测section标题
      if (line.startsWith('===')) {
        if (line.includes('课程')) {
          currentSection = 'courses'
        } else if (line.includes('任务')) {
          currentSection = 'tasks'
        } else if (line.includes('目标')) {
          currentSection = 'goals'
        } else if (line.includes('GPA')) {
          currentSection = 'grades'
        }
        continue
      }

      // 跳过空行和标题行
      if (!line || line.includes('课程名称') || line.includes('任务标题') || line.includes('目标标题')) {
        continue
      }

      // 解析数据行
      const parts = line.split(',').map(p => p.trim().replace(/"/g, ''))
      if (parts.length < 2) continue

      switch (currentSection) {
        case 'courses':
          if (parts.length >= 8) {
            const weekMap: Record<string, number> = { '周一': 1, '周二': 2, '周三': 3, '周四': 4, '周五': 5, '周六': 6, '周日': 7 }
            const weekTypeMap: Record<string, 'all' | 'odd' | 'even'> = { '全周': 'all', '单周': 'odd', '双周': 'even' }
            data.courses.push({
              id: generateId(),
              name: parts[0],
              teacher: parts[1],
              classroom: parts[2],
              dayOfWeek: weekMap[parts[3]] || 1,
              startSection: parseInt(parts[4]) || 1,
              endSection: parseInt(parts[5]) || 2,
              weekType: weekTypeMap[parts[6]] || 'all',
              semester: parts[7],
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            })
          }
          break
        case 'tasks':
          if (parts.length >= 5) {
            const typeMap: Record<string, 'study' | 'life'> = { '学习': 'study', '生活': 'life' }
            const priorityMap: Record<string, 'high' | 'medium' | 'low'> = { '高': 'high', '中': 'medium', '低': 'low' }
            data.tasks.push({
              id: generateId(),
              title: parts[0],
              type: typeMap[parts[1]] || 'study',
              deadline: new Date(parts[2]).toISOString(),
              priority: priorityMap[parts[3]] || 'medium',
              subtasks: [],
              isCompleted: parts[4] === '已完成',
              notified: false,
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            })
          }
          break
        case 'goals':
          if (parts.length >= 5) {
            const typeMap: Record<string, 'semester' | 'exam' | 'habit'> = { '学期': 'semester', '考试': 'exam', '习惯': 'habit' }
            data.goals.push({
              id: generateId(),
              title: parts[0],
              type: typeMap[parts[1]] || 'semester',
              totalProgress: parseInt(parts[2]) || 100,
              currentProgress: parseInt(parts[3]) || 0,
              weight: 5,
              tasks: [],
              milestones: [],
              progressHistory: [],
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            })
          }
          break
        case 'grades':
          if (parts.length >= 5) {
            const scoreTypeMap: Record<string, 'score' | 'grade'> = { '百分制': 'score', '等级制': 'grade' }
            data.grades.push({
              id: generateId(),
              courseName: parts[0],
              credit: parseFloat(parts[1]) || 0,
              scoreType: scoreTypeMap[parts[2]] || 'score',
              score: parts[3],
              semester: parts[4],
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            })
          }
          break
      }
    }

    if (validateData(data)) {
      return data
    }
  } catch (error) {
    console.error('CSV解析失败:', error)
  }
  return null
}

/**
 * 解析Word格式（HTML）
 */
function parseWord(content: string): BackupData | null {
  try {
    // Word文档本质上是HTML，使用相同的解析逻辑
    return parseCSV(content)
  } catch (error) {
    console.error('Word解析失败:', error)
  }
  return null
}

/**
 * 解析Excel兼容格式（制表符分隔）
 */
function parseExcelCSV(content: string): BackupData | null {
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

    const lines = content.split('\n').filter(line => line.trim())
    let currentSection = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // 检测sheet标题
      if (line.startsWith('=== Sheet:')) {
        if (line.includes('课程')) {
          currentSection = 'courses'
        } else if (line.includes('任务')) {
          currentSection = 'tasks'
        } else if (line.includes('目标')) {
          currentSection = 'goals'
        } else if (line.includes('GPA')) {
          currentSection = 'grades'
        }
        continue
      }

      // 跳过空行和标题行
      if (!line || line.includes('课程名称') || line.includes('任务标题') || line.includes('目标标题')) {
        continue
      }

      // 解析数据行（制表符分隔）
      const parts = line.split('\t').map(p => p.trim())
      if (parts.length < 2) continue

      switch (currentSection) {
        case 'courses':
          if (parts.length >= 8) {
            const weekMap: Record<string, number> = { '周一': 1, '周二': 2, '周三': 3, '周四': 4, '周五': 5, '周六': 6, '周日': 7 }
            const weekTypeMap: Record<string, 'all' | 'odd' | 'even'> = { '全周': 'all', '单周': 'odd', '双周': 'even' }
            data.courses.push({
              id: generateId(),
              name: parts[0],
              teacher: parts[1],
              classroom: parts[2],
              dayOfWeek: weekMap[parts[3]] || 1,
              startSection: parseInt(parts[4]) || 1,
              endSection: parseInt(parts[5]) || 2,
              weekType: weekTypeMap[parts[6]] || 'all',
              semester: parts[7],
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            })
          }
          break
        case 'tasks':
          if (parts.length >= 5) {
            const typeMap: Record<string, 'study' | 'life'> = { '学习': 'study', '生活': 'life' }
            const priorityMap: Record<string, 'high' | 'medium' | 'low'> = { '高': 'high', '中': 'medium', '低': 'low' }
            data.tasks.push({
              id: generateId(),
              title: parts[0],
              type: typeMap[parts[1]] || 'study',
              deadline: new Date(parts[2]).toISOString(),
              priority: priorityMap[parts[3]] || 'medium',
              subtasks: [],
              isCompleted: parts[4] === '已完成',
              notified: false,
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            })
          }
          break
        case 'goals':
          if (parts.length >= 5) {
            const typeMap: Record<string, 'semester' | 'exam' | 'habit'> = { '学期': 'semester', '考试': 'exam', '习惯': 'habit' }
            data.goals.push({
              id: generateId(),
              title: parts[0],
              type: typeMap[parts[1]] || 'semester',
              totalProgress: parseInt(parts[2]) || 100,
              currentProgress: parseInt(parts[3]) || 0,
              weight: 5,
              tasks: [],
              milestones: [],
              progressHistory: [],
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            })
          }
          break
        case 'grades':
          if (parts.length >= 5) {
            const scoreTypeMap: Record<string, 'score' | 'grade'> = { '百分制': 'score', '等级制': 'grade' }
            data.grades.push({
              id: generateId(),
              courseName: parts[0],
              credit: parseFloat(parts[1]) || 0,
              scoreType: scoreTypeMap[parts[2]] || 'score',
              score: parts[3],
              semester: parts[4],
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            })
          }
          break
      }
    }

    if (validateData(data)) {
      return data
    }
  } catch (error) {
    console.error('Excel CSV解析失败:', error)
  }
  return null
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * 格式化时间
 */
function formatTime(isoString: string): string {
  return dayjs(isoString).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 清除文件
 */
function clearFile() {
  filePath.value = ''
  fileName.value = ''
  fileSize.value = ''
  exportTime.value = ''
  previewData.value = null
  importResult.value = null
}

/**
 * 切换导入选项
 */
function toggleImportItem(key: string) {
  const index = selectedImportItems.value.indexOf(key)
  if (index > -1) {
    selectedImportItems.value.splice(index, 1)
  } else {
    selectedImportItems.value.push(key)
  }
}

/**
 * 选择导入方式
 */
function selectImportMode(mode: 'overwrite' | 'merge') {
  importMode.value = mode
}

/**
 * 开始导入
 */
async function startImport() {
  if (selectedImportItems.value.length === 0) {
    uni.showToast({
      title: '请至少选择一项数据',
      icon: 'none'
    })
    return
  }

  // 确认导入
  const confirmed = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '确认导入',
      content: importMode.value === 'overwrite'
        ? '覆盖导入将清空现有所有数据，是否继续？'
        : '合并导入将保留现有数据，是否继续？',
      confirmColor: importMode.value === 'overwrite' ? '#ff3b30' : '#007AFF',
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => resolve(false)
    })
  })

  if (!confirmed) return

  isImporting.value = true
  importProgress.value = 0
  importProgressText.value = '准备导入...'

  try {
    if (importMode.value === 'overwrite') {
      await performOverwriteImport()
    } else {
      await performMergeImport()
    }

    importResult.value = {
      success: true,
      message: '数据导入成功！',
      details: generateImportDetails()
    }

    uni.showToast({
      title: '导入成功',
      icon: 'success'
    })

  } catch (error) {
    console.error('导入失败:', error)
    importResult.value = {
      success: false,
      message: '导入失败，请检查文件格式'
    }
  } finally {
    isImporting.value = false
  }
}

/**
 * 执行覆盖导入
 */
async function performOverwriteImport() {
  const steps = selectedImportItems.value.length
  let currentStep = 0

  // 清空现有数据
  importProgressText.value = '清空现有数据...'
  await delay(300)

  if (selectedImportItems.value.includes('courses')) {
    courseStorage.setAll([])
  }
  if (selectedImportItems.value.includes('tasks')) {
    taskStorage.setAll([])
  }
  if (selectedImportItems.value.includes('goals')) {
    goalStorage.setAll([])
  }
  if (selectedImportItems.value.includes('focusSessions')) {
    focusStorage.setAll([])
  }
  if (selectedImportItems.value.includes('grades')) {
    gradeStorage.setAll([])
  }

  importProgress.value = 10

  // 导入新数据
  for (const item of selectedImportItems.value) {
    currentStep++
    importProgressText.value = `导入 ${getItemLabel(item)}...`

    await delay(200)

    switch (item) {
      case 'courses':
        if (previewData.value?.courses) {
          previewData.value.courses.forEach(c => courseStorage.add(c))
        }
        break
      case 'tasks':
        if (previewData.value?.tasks) {
          previewData.value.tasks.forEach(t => taskStorage.add(t))
        }
        break
      case 'goals':
        if (previewData.value?.goals) {
          previewData.value.goals.forEach(g => goalStorage.add(g))
        }
        break
      case 'focusSessions':
        if (previewData.value?.focusSessions) {
          previewData.value.focusSessions.forEach(f => focusStorage.add(f))
        }
        break
      case 'grades':
        if (previewData.value?.grades) {
          previewData.value.grades.forEach(g => gradeStorage.add(g))
        }
        break
      case 'settings':
        if (previewData.value?.settings) {
          settingsStorage.set(previewData.value.settings)
        }
        break
    }

    importProgress.value = 10 + Math.floor((currentStep / steps) * 80)
    await delay(100)
  }

  importProgress.value = 100
  importProgressText.value = '导入完成'
}

/**
 * 执行合并导入
 */
async function performMergeImport() {
  const steps = selectedImportItems.value.length
  let currentStep = 0

  for (const item of selectedImportItems.value) {
    currentStep++
    importProgressText.value = `合并 ${getItemLabel(item)}...`

    await delay(200)

    switch (item) {
      case 'courses':
        if (previewData.value?.courses) {
          previewData.value.courses.forEach(c => courseStorage.update(c))
        }
        break
      case 'tasks':
        if (previewData.value?.tasks) {
          previewData.value.tasks.forEach(t => taskStorage.update(t))
        }
        break
      case 'goals':
        if (previewData.value?.goals) {
          previewData.value.goals.forEach(g => goalStorage.update(g))
        }
        break
      case 'focusSessions':
        if (previewData.value?.focusSessions) {
          previewData.value.focusSessions.forEach(f => focusStorage.update(f))
        }
        break
      case 'grades':
        if (previewData.value?.grades) {
          previewData.value.grades.forEach(g => gradeStorage.update(g))
        }
        break
      case 'settings':
        if (previewData.value?.settings) {
          settingsStorage.update(previewData.value.settings)
        }
        break
    }

    importProgress.value = Math.floor((currentStep / steps) * 100)
    await delay(100)
  }

  importProgress.value = 100
  importProgressText.value = '导入完成'
}

/**
 * 生成导入详情
 */
function generateImportDetails(): string[] {
  const details: string[] = []

  selectedImportItems.value.forEach(item => {
    const count = previewItems.value.find(i => i.key === item)?.count || 0
    if (count > 0) {
      details.push(`${getItemLabel(item)}：${count} 条`)
    }
  })

  return details
}

/**
 * 获取项目标签
 */
function getItemLabel(key: string): string {
  const map: Record<string, string> = {
    courses: '课程',
    tasks: '任务',
    goals: '目标',
    focusSessions: '专注记录',
    grades: 'GPA成绩',
    settings: '设置'
  }
  return map[key] || key
}

/**
 * 延迟
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 返回
 */
function goBack() {
  uni.navigateBack()
}

/**
 * 重置导入
 */
function resetImport() {
  importResult.value = null
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.upload-section {
  padding: 32rpx;
}

.upload-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 80rpx 32rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 2rpx dashed #007AFF;
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.1);
}

.upload-hint {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.upload-desc {
  font-size: 24rpx;
  color: #999;
}

.file-info-section {
  margin: 16rpx;
}

.file-info-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.file-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 4rpx;
}

.file-meta {
  font-size: 24rpx;
  color: #999;
}

.file-actions {
  display: flex;
  gap: 8rpx;
}

.action-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
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

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
}

.item-label {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.item-count {
  padding: 4rpx 12rpx;
  background: #fff;
  border-radius: 4rpx;
  font-size: 22rpx;
  color: #666;
}

.import-mode-selector {
  display: flex;
  gap: 12rpx;
}

.mode-item {
  flex: 1;
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

.mode-item.active {
  background: #f0f8ff;
  border-color: #007AFF;
}

.mode-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.mode-desc {
  font-size: 24rpx;
  color: #999;
  text-align: center;
}

.merge-warning {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 16rpx;
  padding: 12rpx 16rpx;
  background: #fff7e6;
  border-radius: 8rpx;
}

.merge-warning text {
  flex: 1;
  font-size: 24rpx;
  color: #ff9500;
}

.progress-section {
  margin: 16rpx;
  padding: 32rpx 24rpx;
  background: #fff;
  border-radius: 12rpx;
  text-align: center;
}

.progress-text {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.result-section {
  margin: 16rpx;
}

.result-card {
  padding: 48rpx 32rpx;
  background: #fff;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.result-card.success {
  border: 2rpx solid #34C759;
}

.result-card.error {
  border: 2rpx solid #ff3b30;
}

.result-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.result-message {
  font-size: 26rpx;
  color: #666;
}

.result-details {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  text-align: center;
}

.detail-item {
  font-size: 24rpx;
  color: #999;
}

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
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

.btn.primary {
  background: #007AFF;
  color: #fff;
}

.btn.cancel {
  background: #f5f5f5;
  color: #666;
}
</style>
