<template>
  <view class="audio-player">
    <view class="player-status" @tap="togglePlay">
      <view class="status-icon" :class="{ playing: isPlaying }">
        <uni-icons :type="isPlaying ? 'pause-filled' : 'play-filled'" size="24" color="#fff" />
      </view>
      <view class="status-info">
        <text class="status-text">{{ isPlaying ? '播放中' : '已暂停' }}</text>
        <text class="noise-text">{{ currentNoiseText }}</text>
      </view>
    </view>

    <!-- 音量控制 -->
    <view v-if="showVolume" class="volume-control">
      <uni-icons type="sound-filled" size="16" color="#999" />
      <slider
        :value="volume"
        min="0"
        max="100"
        @change="onVolumeChange"
        activeColor="#007AFF"
        backgroundColor="#f0f0f0"
        block-size="16"
        class="volume-slider"
      />
      <text class="volume-text">{{ volume }}%</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NoiseType } from '@/types'

interface Props {
  isPlaying: boolean
  currentNoise: NoiseType
  volume: number
  showVolume?: boolean
}

interface Emits {
  (e: 'toggle'): void
  (e: 'volume-change', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  showVolume: false
})

const emit = defineEmits<Emits>()

const noiseTypes = [
  { value: 'silence' as const, label: '静音' },
  { value: 'rain' as const, label: '雨声' },
  { value: 'forest' as const, label: '森林' },
  { value: 'coffee' as const, label: '咖啡厅' },
  { value: 'library' as const, label: '图书馆' }
]

const currentNoiseText = computed(() => {
  const noise = noiseTypes.find(n => n.value === props.currentNoise)
  return noise?.label || '静音'
})

function togglePlay() {
  emit('toggle')
}

function onVolumeChange(e: { detail: { value: number } }) {
  emit('volume-change', e.detail.value)
}
</script>

<style lang="scss" scoped>
.audio-player {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.player-status {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8rpx;
  cursor: pointer;
}

.status-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.status-icon.playing {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.status-text {
  font-size: 24rpx;
  font-weight: bold;
  color: #fff;
}

.noise-text {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.volume-slider {
  flex: 1;
}

.volume-text {
  font-size: 22rpx;
  color: #666;
  min-width: 60rpx;
  text-align: right;
}
</style>
