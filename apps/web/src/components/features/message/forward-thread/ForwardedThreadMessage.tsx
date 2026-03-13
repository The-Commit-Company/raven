import { ThreadPreviewCard } from "./ThreadPreviewCard"
import type { Message } from "@raven/types/common/Message"
import type { ForwardedThreadMetadata } from "@raven/types/common/Message"

function parseForwardedThread(json: Message["json"]): ForwardedThreadMetadata | null {
    if (!json) return null
    let parsed: unknown
    try {
        parsed = typeof json === "string" ? JSON.parse(json) : json
    } catch {
        return null
    }
    const ft = parsed && typeof parsed === "object" && "forwarded_thread" in parsed
        ? (parsed as { forwarded_thread: unknown }).forwarded_thread
        : null
    if (!ft || typeof ft !== "object" || !("thread_id" in ft)) return null
    const o = ft as Record<string, unknown>
    return {
        thread_id: typeof o.thread_id === "string" ? o.thread_id : "",
        source_channel_id: typeof o.source_channel_id === "string" ? o.source_channel_id : "",
        is_source_dm: !!o.is_source_dm,
        source_workspace: (o.source_workspace as string) ?? null,
        title: (o.title as string) ?? "",
        message_count: (o.message_count as number) ?? 0,
        root_message_snippet: (o.root_message_snippet as string) ?? "",
        last_activity: (o.last_activity as string) ?? "",
        last_message_owner_name: (o.last_message_owner_name as string) ?? "",
        root_message_owner_name: o.root_message_owner_name as string | undefined,
        root_message_owner_image: o.root_message_owner_image as string | undefined,
        participants: o.participants as ForwardedThreadMetadata["participants"],
        preview_replies: o.preview_replies as ForwardedThreadMetadata["preview_replies"],
    }
}

interface ForwardedThreadMessageProps {
    message: Message
}

/** Renders the forwarded thread preview block inside a message (when message is_forwarded and has json.forwarded_thread) */
export function ForwardedThreadMessage({ message }: ForwardedThreadMessageProps) {
    const meta = parseForwardedThread(message.json)
    if (!meta) return null
    return (
        <div className="mt-2">
            <ThreadPreviewCard meta={meta} clickable />
        </div>
    )
}
