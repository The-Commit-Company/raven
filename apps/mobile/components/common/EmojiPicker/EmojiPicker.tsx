import { View } from "react-native"
import EmojiPicker from "rn-emoji-picker"
import { emojis } from "rn-emoji-picker/dist/data"
import { Emoji } from 'rn-emoji-picker/dist/interfaces'
import { useColorScheme } from "@hooks/useColorScheme"

interface EmojiPickerProps {
    onReact: (emoji: string) => void
}
export default function EmojiPickerComponent({ onReact }: EmojiPickerProps) {

    const { colorScheme } = useColorScheme()

    const handleEmojiSelect = (emoji: Emoji) => {
        onReact(emoji.emoji)
    }

    return (
        <View className="flex-1 px-4">
            <EmojiPicker
                emojis={emojis}
                autoFocus={false}
                loading={false}
                darkMode={colorScheme === "dark"}
                perLine={8}
                onSelect={handleEmojiSelect}
                backgroundColor={"transparent"}
            />
        </View>
    )
}