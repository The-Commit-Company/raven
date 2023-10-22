import { createElement, useEffect, useRef } from "react"
import 'emoji-picker-element'
import { useColorModeValue } from "@chakra-ui/react"
import './emojiPicker.styles.css'

export const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {

    const className = useColorModeValue('light', 'dark')
    const ref = useRef<any>(null)

    useEffect(() => {

        const handler = (event: any) => {
            onSelect(event.detail.unicode)
        }
        ref.current?.addEventListener('emoji-click', handler)
        ref.current.skinToneEmoji = '👍'

        return () => {
            ref.current?.removeEventListener('emoji-click', handler)
        }
    }, [])

    return createElement('emoji-picker', { ref, class: className })
}