import { ChannelListItem, DMChannelListItem } from "@raven/types/common/ChannelListItem"

/**
 * Build the chat URL for a message in a channel or DM, optionally focused
 * on a specific message via `?message_id=`.
 *
 *   channel + workspace → `/<workspace>/<channelID>?message_id=<id>`
 *   dm                  → `/dm-channel/<channelID>?message_id=<id>`
 *   orphan (neither)    → `/<channelID>?message_id=<id>`
 */
export function buildMessageUrl(
    channelId: string,
    channel: ChannelListItem | undefined,
    dmChannel: DMChannelListItem | undefined,
    messageId?: string,
): string {
    const qs = messageId ? `?message_id=${encodeURIComponent(messageId)}` : ""
    const id = encodeURIComponent(channelId)
    if (channel?.workspace) return `/${encodeURIComponent(channel.workspace)}/${id}${qs}`
    if (dmChannel) return `/dm-channel/${id}${qs}`
    return `/${id}${qs}`
}
