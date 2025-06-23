import eventBus from '@/utils/event-emitter'

export const updateSavedCount = (delta: number) => {
  const key = 'total_saved_messages'
  const current = parseInt(localStorage.getItem(key) || '0', 10)
  const newValue = Math.max(current + delta, 0)

  localStorage.setItem(key, newValue.toString())
  eventBus.emit('saved:count_changed', { newCount: newValue })
}
