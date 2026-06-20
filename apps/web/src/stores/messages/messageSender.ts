import dayjs from "dayjs"
import { toast } from "sonner"
import type { FrappeError } from "frappe-react-sdk"
import type { Message } from "@raven/types/common/Message"
import { getAttachmentKind } from "@utils/attachmentPreview"
import { getErrorMessage } from "@lib/frappe"
import _ from "@lib/translate"
import { channelMessagesStore } from "./store"
import type { OptimisticMessage } from "./types"

/** Minimal Frappe client — `call` from FrappeContext. */
export type PostClient = {
    post: <T>(method: string, params?: Record<string, unknown>) => Promise<T>
}

/** Backend datetime shape (6-digit microseconds) so the placeholder sorts at the live edge. */
const optimisticNow = () => dayjs().format("YYYY-MM-DD HH:mm:ss.SSS") + "000"

/**
 * Placeholder messages for a send — attachments first, then the text caption,
 * all sharing `batchId` (the client_id) and flagged `sending`.
 */
export const buildOptimisticMessages = (
    channelID: string,
    batchId: string,
    owner: string,
    content: string,
    fileURLs: string[],
): OptimisticMessage[] => {
    const creation = optimisticNow()
    const base = (extra: Partial<Message>): OptimisticMessage =>
        ({
            owner,
            creation,
            channel_id: channelID,
            message_batch_id: batchId,
            _status: "sending",
            ...extra,
        }) as unknown as OptimisticMessage

    const messages = fileURLs.map((url, i) =>
        base({
            name: `${batchId}-${i}`,
            message_type: getAttachmentKind(url) === "image" ? "Image" : "File",
            file: url,
        }),
    )
    if (content) {
        messages.push(base({ name: `${batchId}-text`, message_type: "Text", text: content }))
    }
    return messages
}

/**
 * Fire a send (or re-send) and reconcile the optimistic placeholders against the
 * ack: success replaces them with the real messages; failure flags them for
 * retry/discard. Reuses `batchId` (= client_id) so a retry is the same logical
 * send — the backend can dedupe it once idempotency lands (Layer 4).
 */
export const submitSend = (
    client: PostClient,
    channelID: string,
    batchId: string,
    content: string,
    fileURLs: string[],
) => {
    client
        .post<{ message: Message[] }>("raven.api.raven_message.send_message_with_attachments", {
            channel_id: channelID,
            content,
            files: fileURLs,
            client_id: batchId,
        })
        .then((res) => channelMessagesStore.resolveOptimisticSend(channelID, batchId, res.message ?? []))
        .catch((error: FrappeError) => {
            channelMessagesStore.failOptimisticSend(channelID, batchId)
            // A shared id collapses a burst of failures (e.g. offline) into one toast.
            // It complements the inline failed state for sends that scrolled off-screen.
            toast.error(_("Could not send your message"), {
                id: "message-send-failed",
                description: getErrorMessage(error),
            })
        })
}

/** Re-send a failed batch: rebuild its payload from the placeholders still on screen. */
export const retrySend = (client: PostClient, channelID: string, batchId: string) => {
    const placeholders = channelMessagesStore.getOptimisticMessages(channelID, batchId)
    if (placeholders.length === 0) return
    const content = placeholders.find((m) => m.message_type === "Text")?.text ?? ""
    const fileURLs = placeholders
        .map((m) => (m as { file?: string }).file)
        .filter((url): url is string => !!url)

    channelMessagesStore.retryOptimisticSend(channelID, batchId)
    submitSend(client, channelID, batchId, content, fileURLs)
}
