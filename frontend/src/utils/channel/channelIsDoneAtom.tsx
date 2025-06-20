// atoms/channelIsDoneAtom.ts
import { atom } from 'jotai'

export const channelIsDoneAtom = atom<{ [channelId: string]: number }>({})

// Action atom để update channelIsDoneAtom
export const setChannelIsDoneAtom = atom(
  null,
  (get, set, next: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    const prev = get(channelIsDoneAtom)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const resolved = typeof next === 'function' ? (next as Function)(prev) : next
    set(channelIsDoneAtom, resolved)
  }
)
