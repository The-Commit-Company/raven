import { useTheme } from "@/ThemeProvider"
import Picker from '@emoji-mart/react'

const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
    const { appearance } = useTheme()

    const onEmojiSelect = (emoji: any) => {
        onSelect(emoji.native)
    }

    return <Picker
        maxFrequentRows={2}
        set='apple'
        onEmojiSelect={onEmojiSelect}
        skinTonePosition='search'
        theme={appearance === 'inherit' ? 'auto' : appearance}
        autoFocus={true}
    />


}

export default EmojiPicker