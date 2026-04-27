<template>
  <view class="container">
    <view class="form">
      <!-- 课程名称 -->
      <view class="form-item">
        <text class="label">课程名称 <text class="required">*</text></text>
        <input
          v-model="formData.name"
          class="input"
          placeholder="请输入课程名称"
          maxlength="20"
        />
      </view>

      <!-- 教师姓名 -->
      <view class="form-item">
        <text class="label">教师姓名 <text class="required">*</text></text>
        <input
          v-model="formData.teacher"
          class="input"
          placeholder="请输入教师姓名"
          maxlength="10"
        />
      </view>

      <!-- 教室 -->
      <view class="form-item">
        <text class="label">教室 <text class="required">*</text></text>
        <input
          v-model="formData.classroom"
          class="input"
          placeholder="请输入教室"
          maxlength="20"
        />
      </view>

      <!-- 上课时间 -->
      <view class="form-item">
        <text class="label">上课时间 <text class="required">*</text></text>
        <view class="time-row">
          <picker
            mode="selector"
            :range="weekDays"
            @change="onDayChange"
          >
            <view class="picker">
              <text>{{ weekDays[formData.dayOfWeek - 1] }}</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
          <picker
            mode="selector"
            :range="sectionOptions"
            @change="onStartSectionChange"
          >
            <view class="picker">
              <text>第{{ formData.startSection }}节</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
          <text class="separator">-</text>
          <picker
            mode="selector"
            :range="endSectionOptions"
            @change="onEndSectionChange"
          >
            <view class="picker">
              <text>第{{ formData.endSection }}节</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
        </view>
      </view>

      <!-- 周类型 -->
      <view class="form-item">
        <text class="label">周类型 <text class="required">*</text></text>
        <picker
          mode="selector"
          :range="weekTypeOptions"
          @change="onWeekTypeChange"
        >
          <view class="picker">
            <text>{{ weekTypeOptions[weekTypeIndex] }}</text>
            <uni-icons type="right" size="16" color="#ccc" />
          </view>
        </picker>
      </view>

      <!-- 学期 -->
      <view class="form-item">
        <text class="label">学期 <text class="required">*</text></text>
        <picker
          mode="selector"
          :range="semesterOptions"
          @change="onSemesterChange"
        >
          <view class="picker">
            <text>{{ formData.semester }}</text>
            <uni-icons type="right" size="16" color="#ccc" />
          </view>
        </picker>
      </view>

      <!-- 课程颜色 -->
      <view class="form-item">
        <text class="label">课程颜色</text>
        <view class="color-picker">
          <view
            v-for="color in colors"
            :key="color"
            :class="['color-item', { active: formData.color === color }]"
            :style="{ background: color }"
            @tap="selectColor(color)"
          />
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
import { onLoad } from '@dcloudio/uni-app'
import { courseStorage } from '@/utils/storage'
import type { Course } from '@/types'
import { generateId } from '@/utils'

// ==================== 数据 ====================
const isEdit = ref(false)
const editingId = ref('')

const formData = ref({
  name: '',
  teacher: '',
  classroom: '',
  dayOfWeek: 1,
  startSection: 1,
  endSection: 2,
  weekType: 'all' as 'all' | 'odd' | 'even',
  semester: '2024-2025-2',
  color: '#007AFF'
})

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const sectionOptions = Array.from({ length: 12 }, (_, i) => i + 1)
const weekTypeOptions = ['全周', '单周', '双周']
const semesterOptions = [
  '2023-2024-1', '2023-2024-2',
  '2024-2025-1', '2024-2025-2',
  '2025-2026-1', '2025-2026-2'
]

const colors = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30',
  '#5856D6', '#AF52DE', '#FF2D55', '#5AC8FA'
]

const weekTypeIndex = ref(0)

// ==================== 计算属性 ====================
const endSectionOptions = computed(() => {
  return sectionOptions.filter(s => s >= formData.value.startSection)
})

// ==================== 生命周期 ====================
onLoad((options) => {
  if (options?.id) {
    isEdit.value = true
    editingId.value = options.id
    loadCourse(options.id)
  } else {
    // 从设置中获取当前学期
    const settings = uni.getStorageSync('student_planner_settings')
    if (settings?.currentSemester) {
      formData.value.semester = settings.currentSemester
    }
  }
})

// ==================== 方法 ====================

/**
 * 加载课程数据
 */
function loadCourse(id: string) {
  const course = courseStorage.getById(id)
  if (course) {
    formData.value = {
      name: course.name,
      teacher: course.teacher,
      classroom: course.classroom,
      dayOfWeek: course.dayOfWeek,
      startSection: course.startSection,
      endSection: course.endSection,
      weekType: course.weekType,
      semester: course.semester,
      color: course.color || '#007AFF'
    }
    weekTypeIndex.value = ['all', 'odd', 'even'].indexOf(course.weekType)
  }
}

/**
 * 星期选择
 */
function onDayChange(e: { detail: { value: number } }) {
  formData.value.dayOfWeek = e.detail.value + 1
}

/**
 * 开始节次选择
 */
function onStartSectionChange(e: { detail: { value: number } }) {
  const section = e.detail.value + 1
  formData.value.startSection = section
  if (formData.value.endSection < section) {
    formData.value.endSection = section
  }
}

/**
 * 结束节次选择
 */
function onEndSectionChange(e: { detail: { value: number } }) {
  formData.value.endSection = e.detail.value + formData.value.startSection
}

/**
 * 周类型选择
 */
function onWeekTypeChange(e: { detail: { value: number } }) {
  weekTypeIndex.value = e.detail.value
  const types: Course['weekType'][] = ['all', 'odd', 'even']
  formData.value.weekType = types[e.detail.value]
}

/**
 * 学期选择
 */
function onSemesterChange(e: { detail: { value: number } }) {
  formData.value.semester = semesterOptions[e.detail.value]
}

/**
 * 选择颜色
 */
function selectColor(color: string) {
  formData.value.color = color
}

/**
 * 验证表单
 */
function validateForm(): boolean {
  if (!formData.value.name.trim()) {
    uni.showToast({
      title: '请输入课程名称',
      icon: 'none'
    })
    return false
  }

  if (!formData.value.teacher.trim()) {
    uni.showToast({
      title: '请输入教师姓名',
      icon: 'none'
    })
    return false
  }

  if (!formData.value.classroom.trim()) {
    uni.showToast({
      title: '请输入教室',
      icon: 'none'
    })
    return false
  }

  if (formData.value.endSection < formData.value.startSection) {
    uni.showToast({
      title: '结束节次不能小于开始节次',
      icon: 'none'
    })
    return false
  }

  return true
}

/**
 * 保存课程
 */
function onSave() {
  if (!validateForm()) return

  const now = new Date().toISOString()

  const course: Course = {
    id: isEdit.value ? editingId.value : generateId(),
    name: formData.value.name.trim(),
    teacher: formData.value.teacher.trim(),
    classroom: formData.value.classroom.trim(),
    dayOfWeek: formData.value.dayOfWeek,
    startSection: formData.value.startSection,
    endSection: formData.value.endSection,
    weekType: formData.value.weekType,
    semester: formData.value.semester,
    color: formData.value.color,
    createTime: isEdit.value ? (courseStorage.getById(editingId.value)?.createTime || now) : now,
    updateTime: now
  }

  if (isEdit.value) {
    courseStorage.update(course)
  } else {
    courseStorage.add(course)
  }

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
  uni.showModal({
    title: '确认退出',
    content: '未保存的内容将丢失',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack()
      }
    }
  })
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

.time-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.picker {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
}

.separator {
  color: #999;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.color-item {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  border: 4rpx solid transparent;
  transition: all 0.2s;
}

.color-item.active {
  border-color: #333;
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
