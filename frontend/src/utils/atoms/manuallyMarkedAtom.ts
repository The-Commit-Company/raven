// atoms/manuallyMarkedAtom.ts
import { atom } from 'jotai'

const LOCAL_STORAGE_KEY = 'raven_manually_marked_unread'

const loadInitialMarked = (): Set<string> => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch (e) {
    console.error('Failed to load manually marked from localStorage', e)
    return new Set()
  }
}

export const manuallyMarkedAtom = atom<Set<string>>(loadInitialMarked())

export const addToMarked = atom(null, (get, set, channelId: string) => {
  const updated = new Set(get(manuallyMarkedAtom))
  updated.add(channelId)
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...updated]))
  set(manuallyMarkedAtom, updated)
})

export const removeFromMarked = atom(null, (get, set, channelId: string) => {
  const updated = new Set(get(manuallyMarkedAtom))
  updated.delete(channelId)
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...updated]))
  set(manuallyMarkedAtom, updated)
})
