/**
 * LeftToolbarButtons.tsx - Action buttons for the left side of toolbar
 *
 * Contains quick-access buttons for inserting mentions and emoji:
 * - @user mention
 * - #channel mention
 * - Emoji picker
 */

import { useCurrentEditor } from '@tiptap/react'
import { Button } from '@components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'
import { ToolSeparator, ICON_SIZE } from './ToolBar'
import { AtSign, Hash, Smile } from 'lucide-react'

interface LeftToolbarButtonsProps {
    onEmojiClick?: () => void
}

/**
 * Left-side toolbar action buttons.
 * Must be rendered inside TiptapEditor (within EditorContext.Provider).
 */
export const LeftToolbarButtons = ({ onEmojiClick }: LeftToolbarButtonsProps) => {
    const { editor } = useCurrentEditor()

    if (!editor) return null

    /**
     * Insert a character to trigger mention suggestions.
     */
    const insertTriggerChar = (char: string) => {
        editor.chain().focus().insertContent(char).run()
    }

    return (
        <div className="flex items-center gap-0.5">
            <ActionButton
                icon={<AtSign size={ICON_SIZE} />}
                tooltip="Mention user"
                onClick={() => insertTriggerChar('@')}
            />
            <ActionButton
                icon={<Hash size={ICON_SIZE} />}
                tooltip="Mention channel"
                onClick={() => insertTriggerChar('#')}
            />

            <ToolSeparator />

            <ActionButton
                icon={<Smile size={ICON_SIZE} />}
                tooltip="Add emoji"
                onClick={() => {
                    onEmojiClick?.()
                }}
            />
        </div>
    )
}

interface ActionButtonProps {
    icon: React.ReactNode
    tooltip: string
    onClick: () => void
    disabled?: boolean
}

const ActionButton = ({ icon, tooltip, onClick, disabled }: ActionButtonProps) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={onClick}
                    disabled={disabled}
                >
                    {icon}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
                {tooltip}
            </TooltipContent>
        </Tooltip>
    )
}

export default LeftToolbarButtons
