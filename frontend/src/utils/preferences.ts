import { atomWithStorage } from "jotai/utils"

export const EnterKeyBehaviourAtom = atomWithStorage<"new-line" | "send-message">("raven-enter-key-behaviour", "send-message", undefined, { getOnInit: true })

export const QuickEmojisAtom = atomWithStorage<string[]>("raven-quick-emojis", ["👍", "✅", "👀", "🎉"])