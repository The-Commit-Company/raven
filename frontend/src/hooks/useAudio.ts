let audio: HTMLAudioElement | null = null

export function getNotificationAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(`${import.meta.env.BASE_URL}notification.mp3`)
    audio.volume = 0.7
    audio.preload = 'auto'
  }
  return audio
}
