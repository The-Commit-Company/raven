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
import { ToolSeparator, ICON_SIZE } from '@components/features/ChatInput/ToolBar/ToolBar'
import { AtSign, Hash, Smile } from 'lucide-react'
import EmojiPickerButton from '@components/features/ChatInput/Emoji/EmojiPickerButton'
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
                aria-label="Mention user"
                disabled={!editor.can().chain().focus().insertContent('@').run() || !editor.isEditable}
            />
            <ActionButton
                icon={<Hash size={ICON_SIZE} />}
                tooltip="Mention channel"
                onClick={() => insertTriggerChar('#')}
                aria-label="Mention channel"
                disabled={!editor.can().chain().focus().insertContent('#').run() || !editor.isEditable}
            />

            <ToolSeparator />

            <ActionButton
                icon={<Smile size={ICON_SIZE} />}
                tooltip="Add emoji"
                children={<EmojiPickerButton />}
                aria-label="Add emoji"
            />
        </div>
    )
}

interface ActionButtonProps {
    tooltip: string
    icon?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    ariaLabel?: string
    children?: React.ReactNode
}

// ActionButton component takes in either children to render a component directly or default

const ActionButton = ({ icon, tooltip, onClick, disabled, ariaLabel, children }: ActionButtonProps) => {
    if (children) return children

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
                    aria-label={ariaLabel}
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
