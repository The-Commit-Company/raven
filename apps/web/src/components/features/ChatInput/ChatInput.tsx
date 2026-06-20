import { forwardRef, useCallback, useContext, useEffect, useMemo, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { useAtom, useAtomValue } from "jotai"
import { selectAtom } from "jotai/utils"
import { toast } from "sonner"
import { InputFileList, AddFileButton } from "./InputFiles"
import SendButton from "./SendButton"
import { CreatePollDialog } from "./CreatePollDialog"
import { uploadedFilesAtom, uploadingFilesAtom, pendingSendAtom } from "./useFileInput"
import { enqueueSend } from "@stores/messages/messageSender"
import { useUserCookieData } from "@hooks/useUserCookieData"
import _ from "@lib/translate"

interface ChatInputProps {
    channelID: string
}

/**
 * The message composer.
 *
 * On send, we show the message on screen right away (attachments first, then text,
 * all sharing one client_id so they group together), clear the input, then send to
 * the server. The server's response is the source of truth: it replaces the
 * shown-immediately message with the real one. A failure marks it failed with inline
 * Retry / Discard.
 *
 * Hold-for-uploads: if the user sends while files are still uploading, we don't drop
 * them — we mark the send as waiting and send it automatically once every upload
 * finishes (pendingSendAtom). The actual send (dispatchSend) is split out so the
 * normal path and the waiting path share one implementation.
 */
const ChatInput = forwardRef<HTMLFormElement, ChatInputProps>(({ channelID }, ref) => {
    const { call } = useContext(FrappeContext) as FrappeConfig
    const [files, setFiles] = useAtom(uploadedFilesAtom(channelID))
    const [pendingSend, setPendingSend] = useAtom(pendingSendAtom(channelID))
    const { name: currentUser } = useUserCookieData()

    // The editor's keydown closure (built once) calls the latest handler via this ref.
    const sendRef = useRef<() => void>(() => {})

    // A held send waits on these: any file still uploading blocks dispatch; an
    // errored upload settles but must not be silently sent without. We subscribe
    // to just these booleans (not the array) so per-tick upload-progress updates
    // don't re-render this component — and with it the editor — on every percent.
    const hasUploadsInFlight = useAtomValue(
        useMemo(() => selectAtom(uploadingFilesAtom(channelID), (f) => f.some((file) => file.status === "uploading")), [channelID]),
    )
    const hasFailedUploads = useAtomValue(
        useMemo(() => selectAtom(uploadingFilesAtom(channelID), (f) => f.some((file) => file.status === "error")), [channelID]),
    )

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

    /** Build the optimistic batch, clear the composer, and fire the request. */
    const dispatchSend = useCallback(() => {
        if (!editor) return
        const isEmpty = editor.isEmpty
        if (isEmpty && files.length === 0) return

        const content = isEmpty ? "" : editor.getHTML()
        const outgoingFiles = files.map((f) => ({ file_url: f.fileURL, file_size: f.size }))
        const batchId = crypto.randomUUID()

        // Shows the message on screen, saves it to the outbox, then sends it.
        enqueueSend(call, { channelID, batchId, owner: currentUser, content, files: outgoingFiles })

        // Clear the composer right away — the message is already on screen
        editor.commands.clearContent()
        setFiles([])
        editor.commands.focus()
    }, [editor, files, channelID, currentUser, call, setFiles])

    const handleSend = useCallback(() => {
        if (!editor) return
        // Nothing to send — no text, no uploaded files, nothing staged (uploading or errored).
        if (editor.isEmpty && files.length === 0 && !hasUploadsInFlight && !hasFailedUploads) return

        // Files are still uploading: hold the send. An effect dispatches it once
        // every upload settles, so the in-flight files aren't dropped.
        if (hasUploadsInFlight) {
            setPendingSend(true)
            return
        }

        dispatchSend()
    }, [editor, files, hasUploadsInFlight, hasFailedUploads, dispatchSend, setPendingSend])

    // Held send: once uploads settle, dispatch (or back off if any failed so the
    // user can remove the bad file and retry — we never send silently without it).
    useEffect(() => {
        if (!pendingSend || hasUploadsInFlight) return
        setPendingSend(false)
        if (hasFailedUploads) {
            toast.error(_("Some files failed to upload. Remove them and send again."))
            return
        }
        dispatchSend()
    }, [pendingSend, hasUploadsInFlight, hasFailedUploads, dispatchSend, setPendingSend])

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
                <SendButton onSend={handleSend} loading={pendingSend} />
            </div>
        </form>
    )
})

ChatInput.displayName = "ChatInput"

export default ChatInput
