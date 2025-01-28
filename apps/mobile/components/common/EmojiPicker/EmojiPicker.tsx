import { useEffect, useState } from "react"
import { View } from "react-native"
import * as SecureStore from "expo-secure-store"
import EmojiPicker from "rn-emoji-picker"
import { emojis } from "rn-emoji-picker/dist/data"
import { Emoji } from 'rn-emoji-picker/dist/interfaces'
import { useColorScheme } from "@hooks/useColorScheme"

const RECENT_EMOJIS_KEY = 'recent_emojis_store_key_name_one_1'

interface EmojiPickerProps {
    onReact: (emoji: string) => void
}
export default function EmojiPickerComponent({ onReact }: EmojiPickerProps) {

    const { colorScheme } = useColorScheme()

    const [recentEmojis, setRecentEmojis] = useState<Emoji[]>([])

    const loadRecentEmojis = async () => {
        try {
            const storedEmojis = await SecureStore.getItemAsync(RECENT_EMOJIS_KEY);

            if (storedEmojis) {
                const parseStoreEmojis = JSON.parse(storedEmojis);

                const storedRecentEmojis = parseStoreEmojis
                    .map((recentEmoji: string) => emojis.find(e => e.emoji === recentEmoji))
                    .filter((emoji: Emoji): emoji is Emoji => emoji !== undefined);

                setRecentEmojis(storedRecentEmojis);
            }
        } catch (error) {
            console.error('Error loading recent emojis:', error);
        }
    };

    const saveEmoji = async (emoji: Emoji) => {
        try {
            const isRecentEmoji = recentEmojis.find((recentEmoji: Emoji) => recentEmoji.emoji === emoji.emoji && recentEmoji.unified === emoji.unified);

            if (!isRecentEmoji) {
                await SecureStore.setItemAsync(RECENT_EMOJIS_KEY, JSON.stringify([...recentEmojis.map((recentEmoji: Emoji) => recentEmoji.emoji), emoji.emoji]));
            }
        } catch (error) {
            console.error('Error loading saving emoji:', error)
        }
    }

    useEffect(() => {
        loadRecentEmojis()
    }, [])

    const handleEmojiSelect = (emoji: Emoji) => {
        onReact(emoji.emoji)
        saveEmoji(emoji)
    }

    return (
        <View className="flex-1">
            <EmojiPicker
                emojis={emojis}
                recent={recentEmojis}
                autoFocus={true}
                loading={false}
                darkMode={colorScheme === "dark"}
                perLine={8}
                onSelect={handleEmojiSelect}
                backgroundColor={"transparent"}
            />
        </View>
    )
}