# 白噪音音频资源

## 说明

本目录用于存放专注模式的白噪音音频文件。

## 音频来源

目前使用的音频来自 Mixkit（免费免版权音频）：
- 雨声：https://assets.mixkit.co/active_storage/sfx/2757/2757-preview.mp3
- 森林声：https://assets.mixkit.co/active_storage/sfx/2542/2542-preview.mp3
- 咖啡厅：https://assets.mixkit.co/active_storage/sfx/2729/2729-preview.mp3
- 图书馆：https://assets.mixkit.co/active_storage/sfx/2563/2563-preview.mp3

## 自定义音频

如果您想使用自己的白噪音音频，可以：

1. 将音频文件（MP3/WAV格式）放置在此目录
2. 更新 `/pages/focus/index.vue` 中的 `noiseTypes` 数组
3. 将音频路径配置为本地路径，例如：`/static/audio/rain.mp3`

## 本地音频配置示例

```typescript
const noiseTypes = [
  { label: '静音', value: 'silence', icon: 'sound', url: '' },
  { label: '雨声', value: 'rain', icon: 'cloud', url: '/static/audio/rain.mp3' },
  { label: '森林', value: 'forest', icon: 'eye', url: '/static/audio/forest.mp3' },
  { label: '咖啡厅', value: 'coffee', icon: 'star', url: '/static/audio/coffee.mp3' },
  { label: '图书馆', value: 'library', icon: 'list', url: '/static/audio/library.mp3' }
]
```

## 推荐音频资源

### 免费资源

1. **Mixkit** - https://mixkit.co/free-sound-effects/
   - 免费音效库，无需署名
   - 适合各种白噪音

2. **Freesound** - https://freesound.org/
   - 社区驱动的音效库
   - 需要注册免费账户
   - 大部分免费，部分需要署名

3. **Zapsplat** - https://www.zapsplat.com/
   - 免费音效库
   - 需要署名

### 付费资源

1. **Envato Elements** - https://elements.envato.com/
   - 高质量音频库
   - 订阅制

2. **AudioJungle** - https://audiojungle.net/
   - 按次购买

## 音频格式建议

- **格式**: MP3 或 WAV
- **采样率**: 44.1kHz
- **比特率**: 128kbps 或更高
- **时长**: 至少30秒（便于循环播放）
- **大小**: 建议 <5MB（避免加载缓慢）

## 注意事项

1. **循环播放**: 音频应是无缝可循环的
2. **音质平衡**: 确保音质不会过于刺耳
3. **文件大小**: 考虑小程序包体积限制
4. **版权**: 确保使用的音频有合法授权
