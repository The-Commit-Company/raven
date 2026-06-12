import _ from "@lib/translate"

/**
 * Shape of `Raven Channel.last_message_details` — denormalized by the backend
 * on every message insert (see RavenMessage.set_last_message_timestamp).
 * Arrives as a JSON string.
 */
export type LastMessageDetails = {
    message_id?: string
    content?: string | null
    message_type?: string
    owner?: string
    is_bot_message?: 0 | 1
    bot?: string | null
}

const parseLastMessageDetails = (raw: unknown): LastMessageDetails | null => {
    if (!raw) return null
    try {
        return typeof raw === "string" ? (JSON.parse(raw) as LastMessageDetails) : (raw as LastMessageDetails)
    } catch {
        return null
    }
}

/** Strip HTML and clamp — message content is stored as Tiptap HTML. */
const toPlainText = (content: string, maxLength: number): string => {
    const stripped = content.replace(/<[^>]*>/g, "").trim()
    return stripped.slice(0, maxLength) + (stripped.length > maxLength ? "…" : "")
}

/**
 * Plain-text teaser for a channel's last message, by type: media gets an
 * icon + label (for File messages `content` holds the file name), text gets
 * stripped + clamped. Pass `currentUser` to prefix your own messages with
 * "You:" — in a DM list the other party is implied, but your own last word
 * isn't.
 */
export function getMessageTeaser(lastMessageDetails: unknown, currentUser?: string, maxLength = 80): string {
    const details = parseLastMessageDetails(lastMessageDetails)
    if (!details) return ""

    const body = teaserBody(details, maxLength)
    if (!body) return ""
    if (currentUser && details.owner === currentUser && !details.is_bot_message) {
        return _("You: {0}", [body])
    }
    return body
}

const teaserBody = (details: LastMessageDetails, maxLength: number): string => {
    switch (details.message_type) {
        case "Image":
            return `📷 ${_("Photo")}`
        case "File":
            return `📎 ${details.content?.trim() || _("File")}`
        case "Poll":
            return `📊 ${_("Poll")}`
        default:
            return typeof details.content === "string" && details.content.trim()
                ? toPlainText(details.content, maxLength)
                : _("Message")
    }
}
