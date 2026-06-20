import { forwardRef, useCallback, useContext, useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { useAtom } from "jotai"
import { InputFileList, AddFileButton } from "./InputFiles"
import SendButton from "./SendButton"
import { CreatePollDialog } from "./CreatePollDialog"
import { uploadedFilesAtom } from "./useFileInput"
import { channelMessagesStore } from "@stores/messages/store"
import { buildOptimisticMessages, submitSend } from "@stores/messages/messageSender"
import { useUserCookieData } from "@hooks/useUserCookieData"

interface ChatInputProps {
    channelID: string
}

/**
 * Layer 2 composer: optimistic send. On send we insert placeholder messages
 * immediately (attachments first, text last, all sharing client_id as their batch
 * id), clear the input, then submit. The ack is authoritative — it replaces the
 * placeholders with the real messages; a failure flags them for inline
 * retry/discard (no toast — the inline state is the signal). The realtime echo of
 * our own send is skipped while in flight (store.isPendingSend).
 */
const ChatInput = forwardRef<HTMLFormElement, ChatInputProps>(({ channelID }, ref) => {
    const { call } = useContext(FrappeContext) as FrappeConfig
    const [files, setFiles] = useAtom(uploadedFilesAtom(channelID))
    const { name: currentUser } = useUserCookieData()

    // The editor's keydown closure (built once) calls the latest handler via this ref.
    const sendRef = useRef<() => void>(() => {})

    const editor = useEditor({
        extensions: [StarterKit],
        editorProps: {
            attributes: {
                class: "tiptap min-h-9 max-h-[40vh] overflow-y-auto px-3 py-2 focus:outline-none",
            },
            handleKeyDown: (_view, event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    sendRef.current()
                    return true
                }
                return false
            },
        },
    })

    const handleSend = useCallback(() => {
        if (!editor) return
        const isEmpty = editor.isEmpty
        if (isEmpty && files.length === 0) return

        const content = isEmpty ? "" : editor.getHTML()
        const fileURLs = files.map((f) => f.fileURL)
        const batchId = crypto.randomUUID()

        const optimistic = buildOptimisticMessages(channelID, batchId, currentUser, content, fileURLs)
        channelMessagesStore.addOptimisticMessages(channelID, batchId, optimistic)

        // Clear the composer right away — the message is already on screen
        editor.commands.clearContent()
        setFiles([])
        editor.commands.focus()

        submitSend(call, channelID, batchId, content, fileURLs)
    }, [editor, files, channelID, currentUser, call, setFiles])

    useEffect(() => {
        sendRef.current = handleSend
    }, [handleSend])

    return (
        <form
            ref={ref}
            onSubmit={(e) => {
                e.preventDefault()
                handleSend()
            }}
            className="p-2 pb-4 w-full flex flex-col gap-2"
        >
            <InputFileList channelID={channelID} />
            <div className="flex gap-2 items-end rounded-sm w-full">
                <div className="flex items-center justify-center gap-1">
                    <AddFileButton channelID={channelID} />
                    <CreatePollDialog channelID={channelID} />
                </div>
                <div className="w-full rounded-md border border-outline-gray-2 bg-surface-white focus-within:ring-2 ring-outline-gray-3">
                    <EditorContent editor={editor} />
                </div>
                <SendButton onSend={handleSend} />
            </div>
        </form>
    )
})

ChatInput.displayName = "ChatInput"

export default ChatInput
