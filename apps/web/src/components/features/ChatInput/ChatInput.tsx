import { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { EditorContent } from "@tiptap/react"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { useAtom, useAtomValue } from "jotai"
import { selectAtom } from "jotai/utils"
import { toast } from "sonner"
import { Type } from "lucide-react"
import { InputFileList, AddFileButton } from "./InputFiles"
import SendButton from "./SendButton"
import { MentionButton } from "./MentionButton"
import { EmojiPickerButton } from "./EmojiPickerButton"
import { CreatePollDialog } from "./CreatePollDialog"
import { uploadedFilesAtom, uploadingFilesAtom, pendingSendAtom, useAttachFile } from "./useFileInput"
import { useRavenEditor } from "@components/features/editor/useRavenEditor"
import { EditorFormattingToolbar } from "@components/features/editor/EditorFormattingToolbar"
import { enqueueSend } from "@stores/messages/messageSender"
import { useUserCookieData } from "@hooks/useUserCookieData"
import _ from "@lib/translate"
import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip"
import { cn } from "@lib/utils"
import { Separator } from "@components/ui/separator"
import AttachFrappeDocumentDialog from "./AttachFrappeDocumentDialog"

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

    // Formatting toolbar visibility — off by default (clean composer), toggled by
    // the Type button in the action bar.
    const [showFormatting, setShowFormatting] = useState(false)
    // Bumped by the ⌘⇧U shortcut to open the link popover (also reveals the toolbar).
    const [linkSignal, setLinkSignal] = useState(0)

    // The editor's keydown/paste closures (built once) call the latest handlers via these refs.
    const sendRef = useRef<() => void>(() => { })
    const linkRef = useRef<() => void>(() => { })
    linkRef.current = () => {
        setShowFormatting(true)
        setLinkSignal((n) => n + 1)
    }
    const onAddFile = useAttachFile(channelID)
    const filesRef = useRef<(files: File[]) => void>(() => { })
    filesRef.current = onAddFile

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

    const editor = useRavenEditor({ submitRef: sendRef, linkRef, filesRef, autofocus: true, placeholder: _("Type a message...") })

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
            {/* data-raven-editor + relative: the mention/emoji popups anchor here.
                Everything lives inside the input box (Slack-style): formatting toolbar,
                attachment previews, editor, then the action bar — all sharing one border. */}
            <div data-raven-editor className="relative w-full rounded-lg border border-outline-gray-2 shadow-outline-base bg-surface-white focus-within:border-outline-gray-3">
                <TooltipProvider>
                    {editor && showFormatting && (
                        <EditorFormattingToolbar
                            editor={editor}
                            linkSignal={linkSignal}
                            onLinkConsumed={() => setLinkSignal(0)}
                        />
                    )}
                    <InputFileList channelID={channelID} />
                    <EditorContent editor={editor} />
                    <div className="flex items-center gap-1 px-1.5 pb-1.5">
                        <AddFileButton channelID={channelID} />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    isIconButton
                                    aria-label={_("Formatting")}
                                    aria-pressed={showFormatting}
                                    onClick={() => setShowFormatting((v) => !v)}
                                    className={cn(showFormatting && "bg-surface-gray-3 text-ink-gray-9")}
                                >
                                    <Type />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{_("Formatting")}</TooltipContent>
                        </Tooltip>
                        <Separator orientation="vertical" className="mx-1 h-4!" />
                        {editor && <MentionButton editor={editor} />}
                        {editor && <EmojiPickerButton editor={editor} />}
                        <Separator orientation="vertical" className="mx-1 h-4!" />
                        <CreatePollDialog channelID={channelID} />
                        <AttachFrappeDocumentDialog />
                        <div className="flex-1" />
                        <SendButton onSend={handleSend} loading={pendingSend} />
                    </div>
                </TooltipProvider>
            </div>
        </form>
    )
})

ChatInput.displayName = "ChatInput"

export default ChatInput
