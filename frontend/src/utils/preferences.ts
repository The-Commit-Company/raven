import { atomWithStorage } from "jotai/utils"

export const EnterKeyBehaviourAtom = atomWithStorage<"new-line" | "send-message">("raven-enter-key-behaviour", "send-message")

export const QuickEmojisAtom = atomWithStorage<string[]>("raven-quick-emojis", ["👍", "✅", "👀", "🎉"])