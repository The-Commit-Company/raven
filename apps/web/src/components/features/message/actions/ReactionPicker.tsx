import { useState } from "react"
import { useAtomValue } from "jotai"
import Picker from "@emoji-mart/react"
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { useTheme } from "@components/theme-provider"
import { customEmojiCategoriesAtom } from "@lib/emojiMart"
import { useToggleReaction } from "./useToggleReaction"
import type { Message } from "@raven/types/common/Message"

/** A picked emoji from emoji-mart (`native` for standard, `src`/`id` for custom). */
type PickedEmoji = { id: string; native?: string; src?: string }

/**
 * Emoji picker (emoji-mart) for adding a reaction to a message — reused by the reaction
 * pill row's "+" and the hover toolbar's smiley. `children` is the trigger (a button),
 * rendered via PopoverTrigger asChild. `onOpenChange` lets a caller (the hover toolbar)
 * keep itself mounted while the picker is open.
 */
export const ReactionPicker = ({
    message,
    children,
    tooltip,
    side = "top",
    align = "start",
    onOpenChange,
}: {
    message: Message
    children: React.ReactNode
    tooltip?: string
    side?: "top" | "bottom" | "left" | "right"
    align?: "start" | "center" | "end"
    onOpenChange?: (open: boolean) => void
}) => {
    const [open, setOpen] = useState(false)
    const toggleReaction = useToggleReaction()
    const { themeValue } = useTheme()
    const customEmojis = useAtomValue(customEmojiCategoriesAtom)

    const handleOpenChange = (next: boolean) => {
        setOpen(next)
        onOpenChange?.(next)
    }

    const onSelect = (emoji: PickedEmoji) => {
        if (emoji.native) toggleReaction(message, emoji.native, false)
        else if (emoji.src) toggleReaction(message, emoji.src, true, emoji.id)
        handleOpenChange(false)
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>{children}</PopoverTrigger>
                </TooltipTrigger>
                {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
            </Tooltip>
            <PopoverContent side={side} align={align} className="w-auto border-0 p-0">
                <Picker onEmojiSelect={onSelect} theme={themeValue} set="apple" custom={customEmojis} previewPosition="none" />
            </PopoverContent>
        </Popover>
    )
}
