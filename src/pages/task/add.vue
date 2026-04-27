<template>
  <view class="container">
    <view class="form">
      <!-- 任务类型 -->
      <view class="form-item">
        <text class="label">任务类型 <text class="required">*</text></text>
        <view class="type-selector">
          <view
            v-for="type in taskTypes"
            :key="type.value"
            :class="['type-item', { active: formData.type === type.value }]"
            @tap="selectType(type.value)"
          >
            <text>{{ type.label }}</text>
          </view>
        </view>
      </view>

      <!-- 任务标题 -->
      <view class="form-item">
        <text class="label">任务标题 <text class="required">*</text></text>
        <input
          v-model="formData.title"
          class="input"
          placeholder="请输入任务标题"
          maxlength="50"
        />
      </view>

      <!-- 截止时间 -->
      <view class="form-item">
        <text class="label">截止时间 <text class="required">*</text></text>
        <picker
          mode="date"
          :value="deadlineDate"
          @change="onDateChange"
        >
          <view class="picker">
            <text>{{ deadlineDate }}</text>
            <uni-icons type="right" size="16" color="#ccc" />
          </view>
        </picker>
        <picker
          mode="time"
          :value="deadlineTime"
          @change="onTimeChange"
        >
          <view class="picker">
            <text>{{ deadlineTime }}</text>
            <uni-icons type="right" size="16" color="#ccc" />
          </view>
        </picker>
      </view>

      <!-- 优先级 -->
      <view class="form-item">
        <text class="label">优先级 <text class="required">*</text></text>
        <view class="priority-selector">
          <view
            v-for="priority in priorities"
            :key="priority.value"
            :class="['priority-item', priority.value, { active: formData.priority === priority.value }]"
            @tap="selectPriority(priority.value)"
          >
            <text>{{ priority.label }}</text>
          </view>
        </view>
      </view>

      <!-- 关联课程 -->
      <view class="form-item">
        <text class="label">关联课程</text>
        <picker
          mode="selector"
          :range="courseOptions"
          range-key="name"
          @change="onCourseChange"
        >
          <view class="picker">
            <text>{{ selectedCourseName || '不关联课程' }}</text>
            <uni-icons type="right" size="16" color="#ccc" />
          </view>
        </picker>
      </view>

      <!-- 子任务 -->
      <view class="form-item">
        <view class="form-header">
          <text class="label">子任务</text>
          <view class="add-subtask-btn" @tap="addSubtask">
            <uni-icons type="plus" size="16" color="#007AFF" />
            <text>添加</text>
          </view>
        </view>
        <view v-if="formData.subtasks.length > 0" class="subtask-list">
          <view
            v-for="(subtask, index) in formData.subtasks"
            :key="subtask.id"
            class="subtask-item"
          >
            <view class="subtask-content" @tap="editSubtask(index)">
              <text class="subtask-text">{{ subtask.title }}</text>
            </view>
            <view class="subtask-actions">
              <view
                v-if="index > 0"
                class="action-btn"
                @tap="moveSubtask(index, 'up')"
              >
                <uni-icons type="up" size="16" color="#666" />
              </view>
              <view
                v-if="index < formData.subtasks.length - 1"
                class="action-btn"
                @tap="moveSubtask(index, 'down')"
              >
                <uni-icons type="down" size="16" color="#666" />
              </view>
              <view class="action-btn" @tap="removeSubtask(index)">
                <uni-icons type="close" size="16" color="#ff3b30" />
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-tip">
          <text>暂无子任务，点击上方按钮添加</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="action-bar">
      <view class="btn cancel" @tap="onCancel">
        <text>取消</text>
      </view>
      <view class="btn primary" @tap="onSave">
        <text>保存</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { taskStorage, courseStorage } from '@/utils/storage'
import { useFormAutoSave } from '@/composables/useFormAutoSave'
import type { Task, SubTask } from '@/types'
import { generateId } from '@/utils'

// ==================== 数据 ====================
const formKey = `task_draft_${Date.now()}`
const isEdit = ref(false)
const editingId = ref('')
const initialCourseId = ref('')

const formData = ref({
  type: 'study' as 'study' | 'life',
  title: '',
  deadline: '',
  priority: 'medium' as 'high' | 'medium' | 'low',
  courseId: '',
  subtasks: [] as SubTask[]
})

const taskTypes = [
  { label: '学习任务', value: 'study' },
  { label: '生活任务', value: 'life' }
]

const priorities = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' }
]

const courses = ref<any[]>([])

// 自动保存
const { hasDraft, confirmRestoreDraft, clearDraft } = useFormAutoSave(
  formKey,
  'task',
  formData,
  {
    debounceMs: 1500,
    onRestore: (data) => {
      Object.assign(formData.value, data)
      // 恢复后清理
      setTimeout(clearDraft, 500)
    }
  }
)

// ==================== 计算属性 ====================
const courseOptions = computed(() => {
  const settings = uni.getStorageSync('student_planner_settings')
  const currentSemester = settings?.currentSemester || '2024-2025-2'
  return courses.value.filter(c => c.semester === currentSemester)
})

const selectedCourseName = computed(() => {
  const course = courses.value.find(c => c.id === formData.value.courseId)
  return course?.name || ''
})

const deadlineDate = computed(() => {
  if (!formData.value.deadline) return dayjs().format('YYYY-MM-DD')
  return dayjs(formData.value.deadline).format('YYYY-MM-DD')
})

const deadlineTime = computed(() => {
  if (!formData.value.deadline) return '23:59'
  return dayjs(formData.value.deadline).format('HH:mm')
})

// ==================== 生命周期 ====================
onLoad(async (options) => {
  loadCourses()

  // 如果不是编辑模式，检查是否有草稿
  if (!options?.id) {
    const hasDraftData = await checkDraft()
    if (!hasDraftData) {
      // 设置默认截止时间
      const tomorrow = dayjs().add(1, 'day')
      formData.value.deadline = tomorrow.format('YYYY-MM-DDTHH:mm:ss')

      // 如果传入courseId，自动关联
      if (options?.courseId) {
        initialCourseId.value = options.courseId
        formData.value.courseId = options.courseId
      }
    }
    return
  }

  // 编辑模式
  isEdit.value = true
  editingId.value = options.id
  loadTask(options.id)
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
  return draftRestored
}

/**
 * 加载课程列表
 */
function loadCourses() {
  courses.value = courseStorage.getAll()
}

/**
 * 加载任务数据
 */
function loadTask(id: string) {
  const task = taskStorage.getById(id)
  if (task) {
    formData.value = {
      type: task.type,
      title: task.title,
      deadline: task.deadline,
      priority: task.priority,
      courseId: task.courseId || '',
      subtasks: [...task.subtasks]
    }
  }
}

/**
 * 选择任务类型
 */
function selectType(type: 'study' | 'life') {
  formData.value.type = type
}

/**
 * 日期选择
 */
function onDateChange(e: { detail: { value: string } }) {
  const date = e.detail.value
  const time = deadlineTime.value
  formData.value.deadline = `${date}T${time}:00`
}

/**
 * 时间选择
 */
function onTimeChange(e: { detail: { value: string } }) {
  const date = deadlineDate.value
  const time = e.detail.value
  formData.value.deadline = `${date}T${time}:00`
}

/**
 * 选择优先级
 */
function selectPriority(priority: 'high' | 'medium' | 'low') {
  formData.value.priority = priority
}

/**
 * 课程选择
 */
function onCourseChange(e: { detail: { value: number } }) {
  const index = e.detail.value
  formData.value.courseId = courseOptions.value[index]?.id || ''
}

/**
 * 添加子任务
 */
function addSubtask() {
  uni.showModal({
    title: '添加子任务',
    editable: true,
    placeholderText: '请输入子任务内容',
    success: (res) => {
      if (res.confirm && res.content) {
        // 获取当前最大order值，如果没有则从1开始
        const maxOrder = formData.value.subtasks.length > 0
          ? Math.max(...formData.value.subtasks.map(s => s.order || 0))
          : 0

        formData.value.subtasks.push({
          id: generateId(),
          title: res.content,
          isCompleted: false,
          order: maxOrder + 1
        })

        // 重新验证order值的唯一性和连续性
        validateSubtaskOrders()
      }
    }
  })
}

/**
 * 验证子任务order值
 */
function validateSubtaskOrders() {
  // 检查是否有重复的order值
  const orders = formData.value.subtasks.map(s => s.order)
  const uniqueOrders = [...new Set(orders)]

  if (orders.length !== uniqueOrders.length) {
    // 如果有重复，重新排序
    formData.value.subtasks.forEach((subtask, index) => {
      subtask.order = index + 1
    })
  }
}

/**
 * 编辑子任务
 */
function editSubtask(index: number) {
  const subtask = formData.value.subtasks[index]

  uni.showModal({
    title: '编辑子任务',
    editable: true,
    placeholderText: '请输入子任务内容',
    content: subtask.title,
    success: (res) => {
      if (res.confirm && res.content) {
        formData.value.subtasks[index].title = res.content
      }
    }
  })
}

/**
 * 移动子任务
 */
function moveSubtask(index: number, direction: 'up' | 'down') {
  const subtasks = formData.value.subtasks
  const newIndex = direction === 'up' ? index - 1 : index + 1

  // 交换位置和顺序
  const temp = subtasks[index]
  subtasks[index] = subtasks[newIndex]
  subtasks[newIndex] = temp

  // 更新order值
  const tempOrder = subtasks[index].order
  subtasks[index].order = subtasks[newIndex].order
  subtasks[newIndex].order = tempOrder
}

/**
 * 删除子任务
 */
function removeSubtask(index: number) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个子任务吗？',
    success: (res) => {
      if (res.confirm) {
        formData.value.subtasks.splice(index, 1)
        // 重新排序
        formData.value.subtasks.forEach((s, i) => {
          s.order = i + 1
        })
      }
    }
  })
}

/**
 * 验证表单
 */
function validateForm(): boolean {
  if (!formData.value.title.trim()) {
    uni.showToast({
      title: '请输入任务标题',
      icon: 'none'
    })
    return false
  }

  if (!formData.value.deadline) {
    uni.showToast({
      title: '请选择截止时间',
      icon: 'none'
    })
    return false
  }

  return true
}

/**
 * 保存任务
 */
function onSave() {
  if (!validateForm()) return

  const now = new Date().toISOString()

  const task: Task = {
    id: isEdit.value ? editingId.value : generateId(),
    title: formData.value.title.trim(),
    type: formData.value.type,
    deadline: formData.value.deadline,
    priority: formData.value.priority,
    courseId: formData.value.courseId || undefined,
    subtasks: formData.value.subtasks,
    isCompleted: false,
    createTime: isEdit.value ? (taskStorage.getById(editingId.value)?.createTime || now) : now,
    updateTime: now,
    notified: false
  }

  if (isEdit.value) {
    const existingTask = taskStorage.getById(editingId.value)
    if (existingTask) {
      task.isCompleted = existingTask.isCompleted
      task.completedTime = existingTask.completedTime
    }
    taskStorage.update(task)
  } else {
    taskStorage.add(task)
  }

  clearDraft()

  uni.showToast({
    title: isEdit.value ? '修改成功' : '添加成功',
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
  if (hasDraft.value) {
    uni.showModal({
      title: '确认退出',
      content: '未保存的内容将丢失，是否继续？',
      success: (res) => {
        if (res.confirm) {
          clearDraft()
          uni.navigateBack()
        }
      }
    })
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

.input {
  width: 100%;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
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
  margin-bottom: 12rpx;
}

.priority-selector {
  display: flex;
  gap: 12rpx;
}

.priority-item {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.2s;
}

.priority-item.active {
  color: #fff;
}

.priority-item.high.active {
  background: #ff3b30;
}

.priority-item.medium.active {
  background: #ff9500;
}

.priority-item.low.active {
  background: #34c759;
}

.add-subtask-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  background: #f5f5f5;
  border-radius: 6rpx;
  font-size: 24rpx;
  color: #007AFF;
}

.subtask-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.subtask-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.subtask-item:active {
  background: #f0f0f0;
  border-color: #007AFF;
}

.subtask-content {
  flex: 1;
  padding-right: 12rpx;
}

.subtask-text {
  font-size: 26rpx;
  color: #333;
}

.subtask-actions {
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
