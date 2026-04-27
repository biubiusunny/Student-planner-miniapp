/**
 * 白噪音音频播放器工具类
 * 管理音频播放、暂停、音量控制等
 */

import type { NoiseType } from '@/types'

export interface NoiseConfig {
  label: string
  value: NoiseType
  icon: string
  url: string
}

export class WhiteNoisePlayer {
  private audioContext: UniApp.InnerAudioContext | null = null
  private currentNoise: NoiseType = 'silence'
  private volume: number = 50
  private isPlaying: boolean = false

  constructor() {
    this.initAudio()
  }

  /**
   * 初始化音频上下文
   */
  private initAudio(): void {
    if (this.audioContext) {
      this.stop()
    }
  }

  /**
   * 播放指定噪音
   */
  play(noise: NoiseType, volume: number = 50): void {
    this.currentNoise = noise
    this.volume = volume

    // 静音模式不播放
    if (noise === 'silence') {
      this.stop()
      return
    }

    // 如果正在播放相同的噪音且音量相同，不做任何操作
    if (this.isPlaying && this.currentNoise === noise) {
      console.log('正在播放相同噪音，跳过')
      return
    }

    // 停止当前播放
    this.stop()

    // 创建新的音频上下文
    const noiseConfig = this.getNoiseConfig(noise)
    if (!noiseConfig || !noiseConfig.url) {
      console.warn('未找到噪音配置:', noise)
      return
    }

    try {
      this.audioContext = uni.createInnerAudioContext()
      this.audioContext.src = noiseConfig.url
      this.audioContext.volume = volume / 100
      this.audioContext.loop = true
      this.audioContext.autoplay = true

      // 监听事件
      this.audioContext.onCanplay(() => {
        this.isPlaying = true
        console.log('音频开始播放:', noiseConfig.label)
      })

      this.audioContext.onPlay(() => {
        this.isPlaying = true
      })

      this.audioContext.onPause(() => {
        this.isPlaying = false
      })

      this.audioContext.onStop(() => {
        this.isPlaying = false
      })

      this.audioContext.onError((err) => {
        this.isPlaying = false
        console.error('音频播放错误:', err)
        // 发生错误时清理资源
        this.audioContext?.destroy()
        this.audioContext = null
      })

      this.audioContext.onEnded(() => {
        // 循环播放
        if (this.audioContext && !this.audioContext.paused) {
          this.audioContext.play()
        }
      })
    } catch (error) {
      console.error('创建音频上下文失败:', error)
      this.isPlaying = false
    }
  }

  /**
   * 暂停播放
   */
  pause(): void {
    if (this.audioContext && !this.audioContext.paused) {
      this.audioContext.pause()
    }
  }

  /**
   * 恢复播放
   */
  resume(): void {
    if (this.audioContext && this.audioContext.paused) {
      this.audioContext.play()
    }
  }

  /**
   * 停止播放
   */
  stop(): void {
    if (this.audioContext) {
      this.audioContext.stop()
      this.audioContext.destroy()
      this.audioContext = null
    }
    this.isPlaying = false
  }

  /**
   * 切换播放状态
   */
  toggle(): void {
    if (this.isPlaying) {
      this.pause()
    } else {
      this.resume()
    }
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(100, volume))
    if (this.audioContext) {
      this.audioContext.volume = this.volume / 100
    }
  }

  /**
   * 获取当前音量
   */
  getVolume(): number {
    return this.volume
  }

  /**
   * 获取当前噪音
   */
  getCurrentNoise(): NoiseType {
    return this.currentNoise
  }

  /**
   * 获取播放状态
   */
  getIsPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * 获取噪音配置
   */
  private getNoiseConfig(noise: NoiseType): NoiseConfig | undefined {
    return noiseConfigs.find(n => n.value === noise)
  }

  /**
   * 获取所有噪音配置
   */
  static getNoiseConfigs(): NoiseConfig[] {
    return noiseConfigs
  }

  /**
   * 销毁播放器
   */
  destroy(): void {
    this.stop()
  }
}

/**
 * 噪音配置
 * 音频来源：Mixkit (https://mixkit.co/) - 免费免版权
 */
const noiseConfigs: NoiseConfig[] = [
  {
    label: '静音',
    value: 'silence',
    icon: 'sound',
    url: ''
  },
  {
    label: '雨声',
    value: 'rain',
    icon: 'cloud',
    url: 'https://assets.mixkit.co/active_storage/sfx/2757/2757-preview.mp3'
  },
  {
    label: '森林',
    value: 'forest',
    icon: 'eye',
    url: 'https://assets.mixkit.co/active_storage/sfx/2542/2542-preview.mp3'
  },
  {
    label: '咖啡厅',
    value: 'coffee',
    icon: 'star',
    url: 'https://assets.mixkit.co/active_storage/sfx/2729/2729-preview.mp3'
  },
  {
    label: '图书馆',
    value: 'library',
    icon: 'list',
    url: 'https://assets.mixkit.co/active_storage/sfx/2563/2563-preview.mp3'
  }
]

// 创建单例实例
let playerInstance: WhiteNoisePlayer | null = null

/**
 * 获取单例播放器实例
 */
export function getNoisePlayer(): WhiteNoisePlayer {
  if (!playerInstance) {
    playerInstance = new WhiteNoisePlayer()
  }
  return playerInstance
}

/**
 * 销毁单例实例
 */
export function destroyNoisePlayer(): void {
  if (playerInstance) {
    playerInstance.destroy()
    playerInstance = null
  }
}
