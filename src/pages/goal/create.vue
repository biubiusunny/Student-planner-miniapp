<template>
  <view class="container">
    <!-- 模板选择 -->
    <view v-if="!selectedTemplate && !isCustom" class="template-section">
      <text class="section-title">选择模板</text>
      <view class="template-list">
        <view
          v-for="template in templates"
          :key="template.value"
          class="template-card"
          @tap="selectTemplate(template.value)"
        >
          <view class="template-icon" :style="{ background: template.color }">
            <uni-icons :type="template.icon" size="32" color="#fff" />
          </view>
          <text class="template-name">{{ template.name }}</text>
          <text class="template-desc">{{ template.description }}</text>
        </view>
        <view class="template-card custom" @tap="showCustomForm">
          <view class="template-icon" style="background: #999;">
            <uni-icons type="plus" size="32" color="#fff" />
          </view>
          <text class="template-name">自定义</text>
          <text class="template-desc">创建个性化目标</text>
        </view>
      </view>
    </view>

    <!-- 目标表单 -->
    <view v-else class="form">
      <!-- 目标类型 -->
      <view class="form-item">
        <text class="label">目标类型 <text class="required">*</text></text>
        <view class="type-selector">
          <view
            v-for="type in goalTypes"
            :key="type.value"
            :class="['type-item', { active: formData.type === type.value }]"
            @tap="selectType(type.value)"
          >
            <text>{{ type.label }}</text>
          </view>
        </view>
      </view>

      <!-- 目标标题 -->
      <view class="form-item">
        <text class="label">目标标题 <text class="required">*</text></text>
        <input
          v-model="formData.title"
          class="input"
          placeholder="请输入目标标题"
          maxlength="50"
        />
      </view>

      <!-- 目标描述 -->
      <view class="form-item">
        <text class="label">目标描述</text>
        <textarea
          v-model="formData.description"
          class="textarea"
          placeholder="请输入目标描述（可选）"
          maxlength="200"
        />
      </view>

      <!-- 总目标 -->
      <view class="form-item">
        <text class="label">总目标 <text class="required">*</text></text>
        <input
          v-model.number="formData.totalProgress"
          class="input"
          type="number"
          placeholder="请输入总目标数值"
        />
        <text class="input-hint">例如：单词数量、练习题数、学习时长等</text>
      </view>

      <!-- 目标权重 -->
      <view class="form-item">
        <text class="label">目标权重</text>
        <view class="weight-slider-container">
          <slider
            v-model.number="formData.weight"
            :min="1"
            :max="10"
            :step="1"
            show-value
            activeColor="#007AFF"
            class="weight-slider"
            @change="onWeightChange"
          />
          <view class="weight-labels">
            <text>低</text>
            <text class="weight-value">{{ formData.weight }}</text>
            <text>高</text>
          </view>
        </view>
        <text class="input-hint">权重用于确定目标的重要性，范围1-10</text>
      </view>

      <!-- 截止日期 -->
      <view class="form-item">
        <text class="label">截止日期</text>
        <picker
          mode="date"
          :value="deadlineDate"
          @change="onDateChange"
        >
          <view class="picker">
            <text>{{ deadlineDate || '不设置截止日期' }}</text>
            <uni-icons type="right" size="16" color="#ccc" />
          </view>
        </picker>
      </view>

      <!-- 里程碑 -->
      <view class="form-item">
        <view class="form-header">
          <text class="label">里程碑</text>
          <view class="add-milestone-btn" @tap="addMilestone">
            <uni-icons type="plus" size="16" color="#007AFF" />
            <text>添加</text>
          </view>
        </view>
        <view v-if="formData.milestones.length > 0" class="milestone-list">
          <view
            v-for="(milestone, index) in formData.milestones"
            :key="milestone.id"
            class="milestone-item"
          >
            <view class="milestone-content" @tap="editMilestone(index)">
              <view class="milestone-header">
                <text class="milestone-title">{{ milestone.title }}</text>
                <text class="milestone-progress">{{ milestone.targetProgress }}%</text>
              </view>
              <text v-if="milestone.deadline" class="milestone-deadline">
                截止: {{ formatDate(milestone.deadline) }}
              </text>
            </view>
            <view class="milestone-actions">
              <view
                v-if="index > 0"
                class="action-btn"
                @tap="moveMilestone(index, 'up')"
              >
                <uni-icons type="up" size="16" color="#666" />
              </view>
              <view
                v-if="index < formData.milestones.length - 1"
                class="action-btn"
                @tap="moveMilestone(index, 'down')"
              >
                <uni-icons type="down" size="16" color="#666" />
              </view>
              <view class="action-btn" @tap="removeMilestone(index)">
                <uni-icons type="close" size="16" color="#ff3b30" />
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-tip">
          <text>暂无里程碑，点击上方按钮添加</text>
        </view>
      </view>

      <!-- 预设任务 -->
      <view v-if="formData.tasks.length > 0" class="form-item">
        <view class="form-header">
          <text class="label">预设任务</text>
          <view class="add-task-btn" @tap="addTask">
            <uni-icons type="plus" size="16" color="#007AFF" />
            <text>添加</text>
          </view>
        </view>
        <view class="task-list">
          <view
            v-for="(task, index) in formData.tasks"
            :key="index"
            class="task-item"
          >
            <text>{{ task }}</text>
            <uni-icons
              type="close"
              size="18"
              color="#999"
              @tap="removeTask(index)"
            />
          </view>
        </view>
      </view>

      <!-- 关联任务 -->
      <view class="form-item">
        <text class="label">关联已有任务</text>
        <picker
          mode="multiSelector"
          :range="[taskOptions]"
          @change="onTaskSelect"
        >
          <view class="picker">
            <text>{{ selectedTasksText }}</text>
            <uni-icons type="right" size="16" color="#ccc" />
          </view>
        </picker>
      </view>

      <!-- 返回模板选择 -->
      <view class="back-btn" @tap="backToTemplates">
        <uni-icons type="left" size="16" color="#007AFF" />
        <text>返回模板选择</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="action-bar">
      <view class="btn cancel" @tap="onCancel">
        <text>取消</text>
      </view>
      <view class="btn primary" @tap="onSave">
        <text>创建</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { goalStorage, taskStorage } from '@/utils/storage'
import { useFormAutoSave } from '@/composables/useFormAutoSave'
import type { Goal, Milestone } from '@/types'
import { generateId } from '@/utils'

// ==================== 数据 ====================
const formKey = `goal_draft_${Date.now()}`
const selectedTemplate = ref<Goal['template'] | null>(null)
const isCustom = ref(false)
const initialTemplate = ref<Goal['template'] | null>(null)

const formData = ref({
  title: '',
  description: '',
  type: 'semester' as Goal['type'],
  totalProgress: 100,
  weight: 5,
  currentProgress: 0,
  deadline: '',
  tasks: [] as string[],
  milestones: [] as Milestone[],
  progressHistory: [] as any[]
})

const selectedTaskIndices = ref<number[]>([])

const templates = [
  {
    value: 'cet4' as const,
    name: '四级',
    icon: 'chat',
    color: '#007AFF',
    description: '英语四级考试备考'
  },
  {
    value: 'cet6' as const,
    name: '六级',
    icon: 'chatboxes',
    color: '#5856D6',
    description: '英语六级考试备考'
  },
  {
    value: 'kaoyan' as const,
    name: '考研',
    icon: 'paperplane',
    color: '#FF9500',
    description: '研究生入学考试备考'
  },
  {
    value: 'final' as const,
    name: '期末复习',
    icon: 'calendar',
    color: '#FF3B30',
    description: '期末考试复习计划'
  }
]

const goalTypes = [
  { label: '学期目标', value: 'semester' },
  { label: '考试目标', value: 'exam' },
  { label: '习惯目标', value: 'habit' }
]

// 自动保存
const { hasDraft, confirmRestoreDraft, clearDraft } = useFormAutoSave(
  formKey,
  'goal',
  formData,
  {
    debounceMs: 1500,
    onRestore: (data) => {
      Object.assign(formData.value, data)
      setTimeout(clearDraft, 500)
    }
  }
)

// ==================== 计算属性 ====================
const taskOptions = computed(() => {
  const allTasks = taskStorage.getAll()
  return allTasks
    .filter(t => !t.isCompleted)
    .map(t => t.title)
})

const selectedTasksText = computed(() => {
  const tasks = selectedTaskIndices.value
    .map(index => taskOptions.value[index])
    .filter(Boolean)
  return tasks.length > 0 ? `已选择 ${tasks.length} 个任务` : '选择关联任务'
})

const deadlineDate = computed(() => {
  if (!formData.value.deadline) return ''
  return dayjs(formData.value.deadline).format('YYYY-MM-DD')
})

// ==================== 生命周期 ====================
onLoad(async (options) => {
  // 如果传入template参数，自动选择模板
  if (options?.template) {
    selectTemplate(options.template as Goal['template'])
  } else {
    // 检查是否有草稿
    await checkDraft()
  }
})

onUnload(() => {
  clearDraft()
})

// ==================== 方法 ====================

/**
 * 检查草稿
 */
async function checkDraft(): Promise<boolean> {
  const draftRestored = await confirmRestoreDraft()
  if (draftRestored) {
    selectedTemplate.value = null
    isCustom.value = true
  }
  return draftRestored
}

/**
 * 选择模板
 */
function selectTemplate(template: Goal['template']) {
  selectedTemplate.value = template
  applyTemplate(template)
}

/**
 * 显示自定义表单
 */
function showCustomForm() {
  isCustom.value = true
  selectedTemplate.value = null
  resetFormData()
}

/**
 * 应用模板
 */
function applyTemplate(template: Goal['template']) {
  resetFormData()
  formData.value.template = template

  switch (template) {
    case 'cet4':
      formData.value.title = '英语四级'
      formData.value.type = 'exam'
      formData.value.weight = 7
      formData.value.totalProgress = 4500
      formData.value.deadline = dayjs().add(3, 'month').format('YYYY-MM-DD')
      formData.value.tasks = [
        '背单词 1000 个',
        '做真题 10 套',
        '听力练习 20 小时',
        '阅读理解 50 篇',
        '写作练习 20 篇'
      ]
      formData.value.milestones = [
        {
          id: generateId(),
          title: '完成词汇积累',
          targetProgress: 30,
          deadline: dayjs().add(1, 'month').format('YYYY-MM-DD'),
          isCompleted: false,
          order: 1
        },
        {
          id: generateId(),
          title: '完成听力训练',
          targetProgress: 60,
          deadline: dayjs().add(2, 'month').format('YYYY-MM-DD'),
          isCompleted: false,
          order: 2
        },
        {
          id: generateId(),
          title: '完成全真模拟',
          targetProgress: 90,
          deadline: dayjs().add(2.5, 'month').format('YYYY-MM-DD'),
          isCompleted: false,
          order: 3
        }
      ]
      break

    case 'cet6':
      formData.value.title = '英语六级'
      formData.value.type = 'exam'
      formData.value.weight = 8
      formData.value.totalProgress = 6000
      formData.value.deadline = dayjs().add(3, 'month').format('YYYY-MM-DD')
      formData.value.tasks = [
        '背单词 2000 个',
        '做真题 15 套',
        '听力练习 30 小时',
        '阅读理解 80 篇',
        '翻译练习 30 篇'
      ]
      formData.value.milestones = [
        {
          id: generateId(),
          title: '完成词汇积累',
          targetProgress: 25,
          deadline: dayjs().add(1, 'month').format('YYYY-MM-DD'),
          isCompleted: false,
          order: 1
        },
        {
          id: generateId(),
          title: '完成听力训练',
          targetProgress: 55,
          deadline: dayjs().add(2, 'month').format('YYYY-MM-DD'),
          isCompleted: false,
          order: 2
        },
        {
          id: generateId(),
          title: '完成全真模拟',
          targetProgress: 90,
          deadline: dayjs().add(2.5, 'month').format('YYYY-MM-DD'),
          isCompleted: false,
          order: 3
        }
      ]
      break

    case 'kaoyan':
      formData.value.title = '考研备考'
      formData.value.type = 'exam'
      formData.value.weight = 10
      formData.value.totalProgress = 100
      formData.value.deadline = dayjs().add(6, 'month').format('YYYY-MM-DD')
      formData.value.tasks = [
        '英语复习',
        '数学复习',
        '专业课复习',
        '真题模拟',
        '政治复习'
      ]
      formData.value.milestones = [
        {
          id: generateId(),
          title: '完成基础阶段',
          targetProgress: 30,
          deadline: dayjs().add(2, 'month').format('YYYY-MM-DD'),
          isCompleted: false,
          order: 1
        },
        {
          id: generateId(),
          title: '完成强化阶段',
          targetProgress: 60,
          deadline: dayjs().add(4, 'month').format('YYYY-MM-DD'),
          isCompleted: false,
          order: 2
        },
        {
          id: generateId(),
          title: '完成冲刺阶段',
          targetProgress: 90,
          deadline: dayjs().add(5.5, 'month').format('YYYY-MM-DD'),
          isCompleted: false,
          order: 3
        }
      ]
      break

    case 'final':
      formData.value.title = '期末复习'
      formData.value.type = 'exam'
      formData.value.weight = 9
      formData.value.totalProgress = 50
      formData.value.deadline = dayjs().add(2, 'week').format('YYYY-MM-DD')
      formData.value.tasks = [
        '整理笔记',
        '课后习题',
        '历年真题',
        '重点难点',
        '模拟考试'
      ]
      formData.value.milestones = [
        {
          id: generateId(),
          title: '完成课程复习',
          targetProgress: 40,
          deadline: dayjs().add(1, 'week').format('YYYY-MM-DD'),
          isCompleted: false,
          order: 1
        },
        {
          id: generateId(),
          title: '完成真题练习',
          targetProgress: 75,
          deadline: dayjs().add(1.5, 'week').format('YYYY-MM-DD'),
          isCompleted: false,
          order: 2
        },
        {
          id: generateId(),
          title: '完成模拟测试',
          targetProgress: 90,
          deadline: dayjs().add(1.8, 'week').format('YYYY-MM-DD'),
          isCompleted: false,
          order: 3
        }
      ]
      break
  }
}

/**
 * 重置表单数据
 */
function resetFormData() {
  formData.value = {
    title: '',
    description: '',
    type: 'semester',
    totalProgress: 100,
    weight: 5,
    currentProgress: 0,
    deadline: '',
    tasks: [],
    milestones: [],
    progressHistory: [],
    template: undefined
  }
  selectedTaskIndices.value = []
}

/**
 * 返回模板选择
 */
function backToTemplates() {
  selectedTemplate.value = null
  isCustom.value = false
  resetFormData()
}

/**
 * 选择目标类型
 */
function selectType(type: Goal['type']) {
  formData.value.type = type
}

/**
 * 权重选择
 */
function onWeightChange(e: { detail: { value: number } }) {
  formData.value.weight = e.detail.value
}

/**
 * 日期选择
 */
function onDateChange(e: { detail: { value: string } }) {
  formData.value.deadline = e.detail.value
}

/**
 * 格式化日期
 */
function formatDate(date: string): string {
  return dayjs(date).format('MM月DD日')
}

/**
 * 添加里程碑
 */
function addMilestone() {
  uni.showModal({
    title: '添加里程碑',
    editable: true,
    placeholderText: '请输入里程碑标题',
    success: (res) => {
      if (res.confirm && res.content) {
        const maxOrder = formData.value.milestones.length > 0
          ? Math.max(...formData.value.milestones.map(m => m.order))
          : 0

        formData.value.milestones.push({
          id: generateId(),
          title: res.content,
          targetProgress: Math.min(100, 20 * (formData.value.milestones.length + 1)),
          deadline: undefined,
          isCompleted: false,
          order: maxOrder + 1
        })
      }
    }
  })
}

/**
 * 编辑里程碑
 */
function editMilestone(index: number) {
  const milestone = formData.value.milestones[index]

  uni.showModal({
    title: '编辑里程碑',
    editable: true,
    placeholderText: '请输入里程碑标题',
    content: milestone.title,
    success: (res) => {
      if (res.confirm && res.content) {
        formData.value.milestones[index].title = res.content
      }
    }
  })
}

/**
 * 移动里程碑
 */
function moveMilestone(index: number, direction: 'up' | 'down') {
  const milestones = formData.value.milestones
  const newIndex = direction === 'up' ? index - 1 : index + 1

  // 交换位置和顺序
  const temp = milestones[index]
  milestones[index] = milestones[newIndex]
  milestones[newIndex] = temp

  // 更新order值
  const tempOrder = milestones[index].order
  milestones[index].order = milestones[newIndex].order
  milestones[newIndex].order = tempOrder
}

/**
 * 删除里程碑
 */
function removeMilestone(index: number) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个里程碑吗？',
    success: (res) => {
      if (res.confirm) {
        formData.value.milestones.splice(index, 1)
        // 重新排序
        formData.value.milestones.forEach((m, i) => {
          m.order = i + 1
        })
      }
    }
  })
}

/**
 * 添加任务
 */
function addTask() {
  uni.showModal({
    title: '添加任务',
    editable: true,
    placeholderText: '请输入任务名称',
    success: (res) => {
      if (res.confirm && res.content) {
        formData.value.tasks.push(res.content)
      }
    }
  })
}

/**
 * 删除任务
 */
function removeTask(index: number) {
  formData.value.tasks.splice(index, 1)
}

/**
 * 任务选择
 */
function onTaskSelect(e: { detail: { value: number[] } }) {
  selectedTaskIndices.value = e.detail.value
}

/**
 * 验证表单
 */
function validateForm(): boolean {
  if (!formData.value.title.trim()) {
    uni.showToast({
      title: '请输入目标标题',
      icon: 'none'
    })
    return false
  }

  if (formData.value.totalProgress <= 0) {
    uni.showToast({
      title: '请输入有效的总目标数值',
      icon: 'none'
    })
    return false
  }

  return true
}

/**
 * 保存目标
 */
function onSave() {
  if (!validateForm()) return

  const now = new Date().toISOString()

  // 获取关联的任务ID
  const allTasks = taskStorage.getAll()
  const relatedTaskIds = selectedTaskIndices.value
    .map(index => {
      const task = allTasks.find(t => t.title === taskOptions.value[index])
      return task?.id
    })
    .filter(Boolean) as string[]

  // 初始化进度记录
  const progressHistory = [
    {
      id: generateId(),
      progress: 0,
      delta: 0,
      note: '目标创建',
      createTime: now
    }
  ]

  const goal: Goal = {
    id: generateId(),
    title: formData.value.title.trim(),
    type: formData.value.type,
    totalProgress: formData.value.totalProgress,
    weight: formData.value.weight,
    currentProgress: formData.value.currentProgress,
    tasks: relatedTaskIds,
    milestones: formData.value.milestones,
    progressHistory,
    deadline: formData.value.deadline || undefined,
    template: selectedTemplate.value || undefined,
    createTime: now,
    updateTime: now
  }

  goalStorage.add(goal)

  clearDraft()

  uni.showToast({
    title: '目标已创建',
    icon: 'success'
  })

  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

/**
 * 取消
 */
function onCancel() {
  if (hasDraft.value && (selectedTemplate.value || isCustom.value)) {
    uni.showModal({
      title: '确认退出',
      content: '未保存的内容将丢失，是否继续？',
      success: (res) => {
        if (res.confirm) {
          clearDraft()
          if (selectedTemplate.value || isCustom.value) {
            backToTemplates()
          } else {
            uni.navigateBack()
          }
        }
      }
    })
  } else if (selectedTemplate.value || isCustom.value) {
    backToTemplates()
  } else {
    uni.navigateBack()
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.template-section {
  padding: 24rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.template-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.template-card {
  padding: 32rpx 24rpx;
  background: #fff;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.template-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.template-desc {
  font-size: 24rpx;
  color: #999;
  text-align: center;
}

.template-card.custom {
  border: 2rpx dashed #ccc;
}

.form {
  margin: 16rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.required {
  color: #ff3b30;
}

.input {
  width: 100%;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
}

.input-hint {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.textarea {
  width: 100%;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  min-height: 120rpx;
}

.weight-slider-container {
  padding: 20rpx 0;
}

.weight-slider {
  width: 100%;
  margin: 16rpx 0;
}

.weight-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  color: #999;
}

.weight-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #007AFF;
}

.picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
}

.type-selector {
  display: flex;
  gap: 12rpx;
}

.type-item {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.2s;
}

.type-item.active {
  background: #007AFF;
  color: #fff;
}

.add-milestone-btn,
.add-task-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  background: #f5f5f5;
  border-radius: 6rpx;
  font-size: 24rpx;
  color: #007AFF;
}

.milestone-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.milestone-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.milestone-item:active {
  background: #f0f0f0;
  border-color: #007AFF;
}

.milestone-content {
  flex: 1;
  padding-right: 12rpx;
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rpx;
}

.milestone-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.milestone-progress {
  font-size: 24rpx;
  color: #007AFF;
  font-weight: bold;
}

.milestone-deadline {
  display: block;
  font-size: 22rpx;
  color: #999;
}

.milestone-actions {
  display: flex;
  gap: 8rpx;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  border-radius: 8rpx;
  background: #fff;
  transition: all 0.2s;
}

.action-btn:active {
  background: #f0f0f0;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333;
}

.empty-tip {
  padding: 32rpx;
  text-align: center;
  background: #f9f9f9;
  border-radius: 8rpx;
}

.empty-tip text {
  font-size: 24rpx;
  color: #999;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  justify-content: center;
  padding: 16rpx;
  margin-top: 16rpx;
  color: #007AFF;
  font-size: 26rpx;
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
