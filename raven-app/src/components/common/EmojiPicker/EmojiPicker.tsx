import { createElement, useEffect, useRef } from "react"
import 'emoji-picker-element'
import './emojiPicker.styles.css'

const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {

    const ref = useRef<any>(null)

    useEffect(() => {

        const handler = (event: any) => {
            onSelect(event.detail.unicode)
        }
        ref.current?.addEventListener('emoji-click', handler)
        ref.current.skinToneEmoji = '👍'

        const style = document.createElement('style');
        style.textContent = `.picker { border-radius: var(--radius-4); box-shadow: var(--shadow-6); }`
        ref.current.shadowRoot.appendChild(style);

        return () => {
            ref.current?.removeEventListener('emoji-click', handler)
        }
    }, [])

    return createElement('emoji-picker', { ref })
}

export default EmojiPicker