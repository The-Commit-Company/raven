import { useCurrentEditor } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { Button } from '@components/ui/button'
import { ICON_SIZE } from '@components/features/ChatInput/ToolBar/ToolBar'
import { Smile } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'
import EmojiPicker from '@components/common/EmojiPicker/EmojiPicker'

const EmojiPickerButton = () => {
    const { editor } = useCurrentEditor()
    if (!editor) return null

    const onSelect = (emoji: string, is_custom: boolean, emoji_name?: string) => {
        if (is_custom) {
            editor.chain().focus().setImage({ src: emoji, alt: emoji_name, title: emoji_name }).run()
        } else {
            editor.chain().focus().insertContent(emoji).run()
        }
    }
    return (
        <Popover>

            <Tooltip>
                <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            disabled={!editor.can().chain().focus().insertContent('😅').run() || !editor.isEditable}
                            aria-label="Add emoji"
                        >
                            <Smile size={ICON_SIZE} />
                        </Button>
                    </TooltipTrigger>
                </PopoverTrigger>

                <TooltipContent side="top" className="text-xs">
                    Add emoji
                </TooltipContent>
            </Tooltip>
            <PopoverContent
                className='w-full p-0'
                side='top'
                align='start'
            >
                <EmojiPicker onSelect={onSelect} />
            </PopoverContent>
        </Popover>
    )
}

export default EmojiPickerButton
