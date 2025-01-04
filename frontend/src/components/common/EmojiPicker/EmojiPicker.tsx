import { useIsDesktop } from "@/hooks/useMediaQuery"
import { useTheme } from "@/ThemeProvider"
import { RavenCustomEmoji } from "@/types/RavenMessaging/RavenCustomEmoji"
import Picker from '@emoji-mart/react'
import { useFrappeGetDocList } from "frappe-react-sdk"
import { useMemo, useState } from "react"
import AddCustomEmojiDialog from "./AddCustomEmojiDialog"

const EmojiPicker = ({ onSelect, allowCustomEmojis = true }: { onSelect: (emoji: string, is_custom: boolean, emoji_name?: string) => void, allowCustomEmojis?: boolean }) => {
    const { appearance } = useTheme()

    const [openAddCustomEmojiDialog, setOpenAddCustomEmojiDialog] = useState(false)

    const onEmojiSelect = (emoji: any) => {
        if (emoji.native) {
            onSelect(emoji.native, false)
        } else {
            onSelect(emoji.src, true, emoji.id)
        }
    }

    const isDesktop = useIsDesktop()

    const { data, mutate } = useFrappeGetDocList<RavenCustomEmoji>("Raven Custom Emoji", {
        fields: ["name", "image", "keywords"],
        limit: 1000
    }, allowCustomEmojis ? `custom-emojis` : null, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
    })

    const onAddCustomEmoji = (refresh?: boolean) => {
        setOpenAddCustomEmojiDialog(false)
        if (refresh) {
            mutate()
        }
    }

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
            maxFrequentRows={2}
            set='apple'
            custom={customEmojis}
            onEmojiSelect={onEmojiSelect}
            onAddCustomEmoji={allowCustomEmojis ? () => setOpenAddCustomEmojiDialog(true) : undefined}
            skinTonePosition='search'
            theme={appearance === 'inherit' ? 'auto' : appearance}
            autoFocus={isDesktop}
            showPreview={isDesktop}
        />
        <AddCustomEmojiDialog open={openAddCustomEmojiDialog} onClose={onAddCustomEmoji} />
    </>


}

export default EmojiPicker