import { createElement, useEffect, useRef } from "react"
import 'emoji-picker-element'
import './emojiPicker.styles.css'
import { useTheme } from "@/ThemeProvider"
import { Database } from "emoji-picker-element";

export const emojiDatabase = new Database();

const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {

    const ref = useRef<any>(null)
    const { appearance } = useTheme()

    useEffect(() => {
        const handler = (event: any) => {
            emojiDatabase.incrementFavoriteEmojiCount(event.detail.unicode)
            onSelect(event.detail.unicode)
        }
        ref.current?.addEventListener('emoji-click', handler)
        ref.current.skinToneEmoji = '👍'

        const style = document.createElement('style');
        style.textContent = `.picker { border-radius: var(--radius-4); box-shadow: var(--shadow-6); } input.search{ color: ${appearance === 'light' ? '#020617' : '#f1f5f9'} }`
        ref.current.shadowRoot.appendChild(style);

        return () => {
            ref.current?.removeEventListener('emoji-click', handler)
        }
    }, [])

    return createElement('emoji-picker', { ref })
}

export default EmojiPicker