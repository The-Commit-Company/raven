/**
 * ChatInput.tsx - Main Chat Input Container for Raven v3
 */
import { forwardRef, useCallback } from "react"
import { InputFileList, AddFileButton } from "./InputFiles"
import TiptapEditor from "./TiptapEditor"
import { ToolBar } from "./ToolBar/ToolBar"
import { LeftToolbarButtons } from "./ToolBar/LeftToolbarButtons"
import { TextFormattingBubbleMenu } from "./FormattingMenu/TextFormattingBubbleMenu"
import SendButton from "./SendButton"
import { CreatePollDialog } from "./CreatePollDialog"
import { JSONContent } from "@tiptap/core"
import { MentionItem } from "./Mentions/MentionList"
import { useAttachFile } from "./useFileInput"

interface ChatInputProps {
    channelID: string
    /** Users for @mention suggestions */
    users?: MentionItem[]
    /** Channels for #mention suggestions */
    channels?: MentionItem[]
}

const ChatInput = forwardRef<HTMLFormElement, ChatInputProps>(({ channelID, users = [], channels = [] }, ref) => {

    const onAddFile = useAttachFile(channelID)

    const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log('[ChatInput] Form submitted for channel:', channelID)
    }, [channelID])

    const onEditorUpdate = useCallback((_html: string, _json: JSONContent) => {
        // TODO: Implement draft persistence
        // TODO: Implement typing indicator
    }, [])

    const handleEmojiClick = useCallback(() => {
        // TODO: Open emoji picker
        console.log('[ChatInput] Emoji picker triggered')
    }, [])

    return (
        <form ref={ref} onSubmit={onSubmit} className="p-2 pb-4 w-full flex flex-col gap-2">
            {/* SLOT: Reply Preview */}

            {/* File Previews */}
            <InputFileList channelID={channelID} />

            {/* Main Input Row */}
            <div className="flex gap-2 items-end w-full">

                {/* Editor Container */}
                <div className="flex-1 border rounded-lg border-border overflow-hidden">
                    <TiptapEditor
                        channelID={channelID}
                        placeholder="Type a message..."
                        onUpdate={onEditorUpdate}
                        users={users}
                        channels={channels}
                        onAddFile={onAddFile}
                    >
                        {/* BubbleMenu - appears when text is selected */}
                        <TextFormattingBubbleMenu />

                        {/* Bottom Toolbar */}
                        <ToolBar>
                            <div className="flex items-center">
                                {/* Leftmost Actions - File upload and Poll */}
                                <div className="gap-1.5 flex items-center">
                                    <AddFileButton channelID={channelID} />
                                    <CreatePollDialog channelID={channelID} />
                                </div>
                                {/* other left toolbar buttons */}
                                <LeftToolbarButtons onEmojiClick={handleEmojiClick} />
                            </div>
                            {/* Rightmost Action - Send button */}
                            <SendButton channelID={channelID} />
                        </ToolBar>
                    </TiptapEditor>
                </div>
            </div>
        </form>
    )
})

export default ChatInput
