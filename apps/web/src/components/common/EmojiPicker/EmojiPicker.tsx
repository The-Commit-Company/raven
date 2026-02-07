import { RavenCustomEmoji } from "@raven/types/RavenMessaging/RavenCustomEmoji"
import Picker from '@emoji-mart/react'
import { useFrappeGetDocList } from "frappe-react-sdk"
import { useMemo } from "react"
import { useTheme } from "@components/theme-provider"

const EmojiPicker = ({ onSelect, allowCustomEmojis = true }: { onSelect: (emoji: string, is_custom: boolean, emoji_name?: string) => void, allowCustomEmojis?: boolean }) => {
    const { theme } = useTheme()

    const onEmojiSelect = (emoji: any) => {
        if (emoji.native) {
            onSelect(emoji.native, false)
        } else {
            onSelect(emoji.src, true, emoji.id)
        }
    }

    const { data, mutate } = useFrappeGetDocList<RavenCustomEmoji>("Raven Custom Emoji", {
        fields: ["name", "image", "keywords"],
        limit: 1000
    }, allowCustomEmojis ? `custom-emojis` : null, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
    })

    const customEmojis = useMemo(() => {
        if (!allowCustomEmojis) return undefined

        if (!data) return undefined

        return [{
            id: "Custom",
            name: "Custom",
            emojis: data.map((emoji) => ({
                id: emoji.name,
                name: emoji.name,
                keywords: emoji.keywords?.split(','),
                skins: [{ src: emoji.image }]
            }))
        }]

    }, [data, allowCustomEmojis])

    return <>
        <Picker
            autoFocus={true}
            maxFrequentRows={2}
            set='apple'
            custom={customEmojis}
            onEmojiSelect={onEmojiSelect}
            skinTonePosition='search'
            theme={theme === 'system' ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light') : theme}
            style={{
                border: 'none',
                '.picker': {
                    '--border-size': '2px',
                }
            }}
        />
    </>


}

export default EmojiPicker
