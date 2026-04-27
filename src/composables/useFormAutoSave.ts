/**
 * 表单自动保存组合式函数
 * 用于表单数据的自动保存和恢复
 */

import { ref, watch, onUnmounted } from 'vue'
import { draftStorage } from '@/utils/storage'
import type { FormDraft } from '@/types'

export function useFormAutoSave<T extends Record<string, any>>(
  formKey: string,
  draftType: FormDraft['type'],
  formData: T,
  options: {
    enable?: boolean
    debounceMs?: number
    onSave?: (data: T) => void
    onRestore?: (data: T) => void
  } = {}
) {
  const {
    enable = true,
    debounceMs = 1000,
    onSave,
    onRestore
  } = options

  let saveTimer: NodeJS.Timeout | null = null
  const hasDraft = ref(false)

  /**
   * 保存草稿
   */
  const saveDraft = () => {
    if (!enable) return

    if (saveTimer) {
      clearTimeout(saveTimer)
    }

    saveTimer = setTimeout(() => {
      try {
        draftStorage.save(formKey, draftType, formData)
        hasDraft.value = true
        onSave?.(formData)
      } catch (error) {
        console.error('保存草稿失败:', error)
      }
    }, debounceMs)
  }

  /**
   * 加载草稿
   */
  const loadDraft = (): T | null => {
    if (!enable) return null

    try {
      const draft = draftStorage.get(formKey)
      if (draft && draft.type === draftType) {
        hasDraft.value = true
        onRestore?.(draft.data)
        return draft.data as T
      }
    } catch (error) {
      console.error('加载草稿失败:', error)
    }
    return null
  }

  /**
   * 清除草稿
   */
  const clearDraft = () => {
    try {
      draftStorage.delete(formKey)
      hasDraft.value = false
    } catch (error) {
      console.error('清除草稿失败:', error)
    }
  }

  /**
   * 确认恢复草稿
   */
  const confirmRestoreDraft = async (): Promise<boolean> => {
    const draft = draftStorage.get(formKey)
    if (!draft || draft.type !== draftType) return false

    return new Promise((resolve) => {
      uni.showModal({
        title: '发现未保存的草稿',
        content: `上次编辑于 ${new Date(draft.updateTime).toLocaleString('zh-CN')}\n是否恢复草稿内容？`,
        confirmText: '恢复',
        cancelText: '清除',
        success: (res) => {
          if (res.confirm) {
            loadDraft()
            resolve(true)
          } else if (res.cancel) {
            clearDraft()
            resolve(false)
          } else {
            resolve(false)
          }
        }
      })
    })
  }

  // 监听表单数据变化，自动保存
  watch(
    () => formData,
    () => {
      saveDraft()
    },
    { deep: true }
  )

  // 组件卸载时清除定时器
  onUnmounted(() => {
    if (saveTimer) {
      clearTimeout(saveTimer)
    }
  })

  return {
    hasDraft,
    saveDraft,
    loadDraft,
    clearDraft,
    confirmRestoreDraft
  }
}
