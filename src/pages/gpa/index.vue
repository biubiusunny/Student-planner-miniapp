<template>
  <view class="container">
    <!-- GPA统计卡片 -->
    <view class="gpa-card">
      <view class="gpa-header">
        <text class="gpa-title">我的GPA</text>
        <text class="gpa-subtitle">4.0标准</text>
      </view>

      <view class="gpa-main">
        <text class="gpa-value">{{ gpa }}</text>
        <text class="gpa-unit">GPA</text>
      </view>

      <view class="gpa-stats">
        <view class="stat-item">
          <text class="stat-value">{{ totalCredits }}</text>
          <text class="stat-label">总学分</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ weightedAverage }}</text>
          <text class="stat-label">加权平均分</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ gradeCount }}</text>
          <text class="stat-label">科目数</text>
        </view>
      </view>
    </view>

    <!-- 学期选择 -->
    <view class="semester-filter">
      <picker
        mode="selector"
        :range="semesterOptions"
        @change="onSemesterChange"
      >
        <view class="picker">
          <text>{{ currentSemester || '全部学期' }}</text>
          <uni-icons type="right" size="16" color="#ccc" />
        </view>
      </picker>
    </view>

    <!-- 成绩列表 -->
    <view class="grade-list">
      <view
        v-for="grade in filteredGrades"
        :key="grade.id"
        class="grade-item"
        @tap="editGrade(grade.id)"
      >
        <view class="grade-main">
          <text class="course-name">{{ grade.courseName }}</text>
          <view class="grade-info">
            <text class="credit">{{ grade.credit }}学分</text>
            <text :class="['score', `score-${getScoreClass(grade.score)}`]">
              {{ grade.scoreType === 'grade' ? grade.score : grade.score + '分' }}
            </text>
          </view>
        </view>
        <view class="grade-footer">
          <text class="semester">{{ formatSemester(grade.semester) }}</text>
          <view class="gpa-point">
            <text>GPA: {{ calculateGradeGPA(grade.score) }}</text>
          </view>
        </view>
        <view class="delete-btn" @tap.stop="deleteGrade(grade.id)">
          <uni-icons type="trash" size="18" color="#ff3b30" />
        </view>
      </view>

      <view v-if="filteredGrades.length === 0" class="empty">
        <text>暂无成绩记录，点击下方按钮添加</text>
      </view>
    </view>

    <!-- 添加按钮 -->
    <view class="fab" @tap="addGrade">
      <uni-icons type="plus" size="24" color="#fff" />
    </view>

    <!-- 添加/编辑成绩弹窗 -->
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <text class="popup-title">{{ isEditMode ? '编辑成绩' : '添加成绩' }}</text>

        <view class="form-item">
          <text class="label">课程名称 <text class="required">*</text></text>
          <input
            v-model="formData.courseName"
            class="input"
            placeholder="请输入课程名称"
            maxlength="30"
          />
        </view>

        <view class="form-item">
          <text class="label">学分 <text class="required">*</text></text>
          <input
            v-model.number="formData.credit"
            class="input"
            type="digit"
            placeholder="请输入学分"
            maxlength="4"
          />
        </view>

        <view class="form-item">
          <text class="label">成绩类型 <text class="required">*</text></text>
          <view class="type-selector">
            <view
              v-for="type in scoreTypes"
              :key="type.value"
              :class="['type-item', { active: formData.scoreType === type.value }]"
              @tap="selectScoreType(type.value)"
            >
              <text>{{ type.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="label">成绩 <text class="required">*</text></text>

          <!-- 等级制 -->
          <view v-if="formData.scoreType === 'grade'" class="grade-options">
            <view
              v-for="option in gradeOptions"
              :key="option.value"
              :class="['grade-option', { active: formData.score === option.value }]"
              @tap="selectGrade(option.value)"
            >
              <text class="grade-text">{{ option.label }}</text>
              <text class="grade-range">{{ option.range }}</text>
            </view>
          </view>

          <!-- 百分制 -->
          <input
            v-else
            v-model.number="formData.score"
            class="input"
            type="number"
            placeholder="请输入成绩 (0-100)"
            maxlength="3"
          />
        </view>

        <view class="form-item">
          <text class="label">学期 <text class="required">*</text></text>
          <picker
            mode="selector"
            :range="semesterOptions"
            @change="onFormSemesterChange"
          >
            <view class="picker">
              <text>{{ formData.semester }}</text>
              <uni-icons type="right" size="16" color="#ccc" />
            </view>
          </picker>
        </view>

        <view class="popup-actions">
          <view class="btn cancel" @tap="closePopup">
            <text>取消</text>
          </view>
          <view class="btn primary" @tap="saveGrade">
            <text>保存</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { gradeStorage } from '@/utils/storage'
import type { Grade } from '@/types'
import { generateId } from '@/utils'

// ==================== 数据 ====================
const popup = ref()
const isEditMode = ref(false)
const editingId = ref('')
const currentSemester = ref('')

const formData = ref({
  courseName: '',
  credit: '',
  scoreType: 'score' as 'score' | 'grade',
  score: '',
  semester: '2024-2025-2'
})

const scoreTypes = [
  { label: '百分制', value: 'score' },
  { label: '等级制', value: 'grade' }
]

const gradeOptions = [
  { label: 'A+', value: 'A+', range: '95-100' },
  { label: 'A', value: 'A', range: '90-94' },
  { label: 'A-', value: 'A-', range: '85-89' },
  { label: 'B+', value: 'B+', range: '80-84' },
  { label: 'B', value: 'B', range: '75-79' },
  { label: 'B-', value: 'B-', range: '70-74' },
  { label: 'C+', value: 'C+', range: '65-69' },
  { label: 'C', value: 'C', range: '60-64' },
  { label: 'D', value: 'D', range: '50-59' },
  { label: 'F', value: 'F', range: '0-49' }
]

const semesterOptions = [
  '全部学期',
  '2023-2024-1', '2023-2024-2',
  '2024-2025-1', '2024-2025-2',
  '2025-2026-1', '2025-2026-2'
]

// ==================== 计算属性 ====================
const allGrades = computed(() => gradeStorage.getAll())

const filteredGrades = computed(() => {
  if (!currentSemester.value || currentSemester.value === '全部学期') {
    return allGrades.value
  }
  return allGrades.value.filter(g => g.semester === currentSemester.value)
})

const totalCredits = computed(() => {
  return filteredGrades.value.reduce((sum, g) => sum + g.credit, 0)
})

const weightedAverage = computed(() => {
  if (filteredGrades.value.length === 0) return 0

  let totalScore = 0
  let totalWeight = 0

  filteredGrades.value.forEach(grade => {
    const score = convertToScore(grade.score, grade.scoreType)
    totalScore += score * grade.credit
    totalWeight += grade.credit
  })

  return totalWeight === 0 ? 0 : (totalScore / totalWeight).toFixed(2)
})

const gpa = computed(() => {
  if (filteredGrades.value.length === 0) return '0.00'

  let totalGPA = 0
  let totalCredits = 0

  filteredGrades.value.forEach(grade => {
    const gradeGPA = calculateGradeGPA(grade.score)
    totalGPA += gradeGPA * grade.credit
    totalCredits += grade.credit
  })

  return totalCredits === 0 ? '0.00' : (totalGPA / totalCredits).toFixed(2)
})

const gradeCount = computed(() => filteredGrades.value.length)

// ==================== 生命周期 ====================
onMounted(() => {
  // 从设置中获取当前学期
  const settings = uni.getStorageSync('student_planner_settings')
  if (settings?.currentSemester) {
    formData.value.semester = settings.currentSemester
    currentSemester.value = settings.currentSemester
  }
})

// ==================== 方法 ====================

/**
 * 学期筛选变化
 */
function onSemesterChange(e: { detail: { value: number } }) {
  currentSemester.value = semesterOptions[e.detail.value]
}

/**
 * 表单学期选择
 */
function onFormSemesterChange(e: { detail: { value: number } }) {
  formData.value.semester = semesterOptions[e.detail.value]
}

/**
 * 转换为百分制分数
 */
function convertToScore(score: string | number, scoreType: 'score' | 'grade'): number {
  if (scoreType === 'score') {
    const num = Number(score)
    // 验证数值范围
    if (isNaN(num) || num < 0 || num > 100) {
      console.warn(`无效的百分制分数: ${score}`)
      return 0
    }
    return num
  }

  // 等级制转换
  const gradeMap: Record<string, number> = {
    'A+': 97,
    'A': 92,
    'A-': 87,
    'B+': 82,
    'B': 77,
    'B-': 72,
    'C+': 67,
    'C': 62,
    'D': 55,
    'F': 40
  }

  const scoreStr = String(score).toUpperCase()
  const mappedScore = gradeMap[scoreStr]

  if (mappedScore === undefined) {
    console.warn(`未知的等级: ${score}`)
    return 0
  }

  return mappedScore
}

/**
 * 计算单个成绩的GPA（4.0制）
 */
function calculateGradeGPA(score: string | number): number {
  const scoreNum = convertToScore(score, formData.value.scoreType)

  // 4.0制标准
  if (scoreNum >= 90) return 4.0
  if (scoreNum >= 85) return 3.7
  if (scoreNum >= 82) return 3.3
  if (scoreNum >= 78) return 3.0
  if (scoreNum >= 75) return 2.7
  if (scoreNum >= 72) return 2.3
  if (scoreNum >= 68) return 2.0
  if (scoreNum >= 64) return 1.5
  if (scoreNum >= 60) return 1.0
  return 0
}

/**
 * 获取成绩样式类
 */
function getScoreClass(score: string | number): string {
  const scoreNum = convertToScore(score, formData.value.scoreType)
  if (scoreNum >= 85) return 'excellent'
  if (scoreNum >= 75) return 'good'
  if (scoreNum >= 60) return 'pass'
  return 'fail'
}

/**
 * 格式化学期
 */
function formatSemester(semester: string): string {
  const [year, term] = semester.split('-')
  return `${year}-${term}学期`
}

/**
 * 选择成绩类型
 */
function selectScoreType(type: 'score' | 'grade') {
  formData.value.scoreType = type
  formData.value.score = ''
}

/**
 * 选择等级
 */
function selectGrade(grade: string) {
  formData.value.score = grade
}

/**
 * 打开弹窗
 */
function openPopup() {
  popup.value?.open()
}

/**
 * 关闭弹窗
 */
function closePopup() {
  popup.value?.close()
  resetForm()
}

/**
 * 重置表单
 */
function resetForm() {
  formData.value = {
    courseName: '',
    credit: '',
    scoreType: 'score',
    score: '',
    semester: currentSemester.value || '2024-2025-2'
  }
  isEditMode.value = false
  editingId.value = ''
}

/**
 * 添加成绩
 */
function addGrade() {
  resetForm()
  openPopup()
}

/**
 * 编辑成绩
 */
function editGrade(id: string) {
  const grade = gradeStorage.getById(id)
  if (grade) {
    isEditMode.value = true
    editingId.value = id
    formData.value = {
      courseName: grade.courseName,
      credit: grade.credit.toString(),
      scoreType: grade.scoreType,
      score: grade.score.toString(),
      semester: grade.semester
    }
    openPopup()
  }
}

/**
 * 删除成绩
 */
function deleteGrade(id: string) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条成绩记录吗？',
    success: (res) => {
      if (res.confirm) {
        gradeStorage.delete(id)
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
      }
    }
  })
}

/**
 * 验证表单
 */
function validateForm(): boolean {
  if (!formData.value.courseName.trim()) {
    uni.showToast({
      title: '请输入课程名称',
      icon: 'none'
    })
    return false
  }

  if (!formData.value.credit || formData.value.credit <= 0) {
    uni.showToast({
      title: '请输入有效学分',
      icon: 'none'
    })
    return false
  }

  if (!formData.value.score) {
    uni.showToast({
      title: '请输入成绩',
      icon: 'none'
    })
    return false
  }

  if (formData.value.scoreType === 'score') {
    const score = Number(formData.value.score)
    if (isNaN(score) || score < 0 || score > 100) {
      uni.showToast({
        title: '成绩范围应为0-100',
        icon: 'none'
      })
      return false
    }
  }

  return true
}

/**
 * 保存成绩
 */
function saveGrade() {
  if (!validateForm()) return

  const now = new Date().toISOString()

  const grade: Grade = {
    id: isEditMode.value ? editingId.value : generateId(),
    courseName: formData.value.courseName.trim(),
    credit: Number(formData.value.credit),
    scoreType: formData.value.scoreType,
    score: Number(formData.value.score),
    semester: formData.value.semester,
    createTime: isEditMode.value ? (gradeStorage.getById(editingId.value)?.createTime || now) : now,
    updateTime: now
  }

  if (isEditMode.value) {
    gradeStorage.update(grade)
  } else {
    gradeStorage.add(grade)
  }

  uni.showToast({
    title: isEditMode.value ? '修改成功' : '添加成功',
    icon: 'success'
  })

  closePopup()
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.gpa-card {
  margin: 16rpx;
  padding: 32rpx 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.gpa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.gpa-title {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.gpa-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.gpa-main {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 32rpx;
}

.gpa-value {
  font-size: 80rpx;
  font-weight: bold;
  color: #fff;
  line-height: 1;
}

.gpa-unit {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.gpa-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 24rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.semester-filter {
  margin: 0 16rpx 16rpx;
}

.picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.grade-list {
  margin: 0 16rpx;
}

.grade-item {
  position: relative;
  padding: 24rpx;
  margin-bottom: 12rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.grade-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.course-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-right: 16rpx;
}

.grade-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.credit {
  font-size: 24rpx;
  color: #999;
}

.score {
  font-size: 28rpx;
  font-weight: bold;
}

.score-excellent {
  color: #34c759;
}

.score-good {
  color: #007AFF;
}

.score-pass {
  color: #ff9500;
}

.score-fail {
  color: #ff3b30;
}

.grade-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.semester {
  font-size: 24rpx;
  color: #999;
}

.gpa-point {
  padding: 4rpx 12rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4rpx;
  font-size: 22rpx;
  color: #fff;
}

.delete-btn {
  position: absolute;
  right: 16rpx;
  bottom: 16rpx;
  padding: 8rpx;
  opacity: 0;
  transition: opacity 0.2s;
}

.grade-item:active .delete-btn {
  opacity: 1;
}

.empty {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: 32rpx;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
}

/* 弹窗样式 */
.popup-content {
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.popup-title {
  display: block;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 32rpx;
}

.form-item {
  margin-bottom: 24rpx;
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

.type-selector {
  display: flex;
  gap: 12rpx;
}

.type-item {
  flex: 1;
  padding: 16rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.2s;
}

.type-item.active {
  background: #007AFF;
  color: #fff;
}

.grade-options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8rpx;
}

.grade-option {
  padding: 12rpx 8rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  transition: all 0.2s;
}

.grade-option.active {
  background: #007AFF;
}

.grade-text {
  display: block;
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 4rpx;
}

.grade-option.active .grade-text {
  color: #fff;
}

.grade-range {
  display: block;
  font-size: 20rpx;
  color: #999;
}

.grade-option.active .grade-range {
  color: rgba(255, 255, 255, 0.8);
}

.popup-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 32rpx;
}

.btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 8rpx;
  text-align: center;
  font-size: 28rpx;
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
