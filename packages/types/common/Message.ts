export type Message = FileMessage | TextMessage | ImageMessage | PollMessage | SystemMessage

export interface BaseMessage {
    name: string,
    owner: string,
    _liked_by: string,
    channel_id: string,
    creation: string,
    modified: string,
    message_type: 'Text' | 'File' | 'Image' | 'Poll' | 'System',
    message_reactions?: string | null,
    is_continuation: 1 | 0
    is_reply: 1 | 0
    linked_message?: string | null
    link_doctype?: string
    link_document?: string
    is_edited: 1 | 0
    is_forwarded: 1 | 0
    /** JSON as string */
    replied_message_details?: string,
    poll_id?: string
    is_bot_message?: 1 | 0,
    bot?: string,
    hide_link_preview?: 1 | 0,
    is_thread: 1 | 0,
    /** Formatted timestamp - being used on the mobile app */
    formattedTime?: string,
    is_pinned: 1 | 0,
    might_contain_link_preview?: boolean,
    content?: string,
    isOpenInThread?: boolean,
    /** Optional JSON payload (e.g. converted_to_channel_*, forwarded_thread). Backend shape TBD. */
    json?: string | Record<string, unknown>,
}

export interface FileMessage extends BaseMessage {
    text: string,
    file: string,
    message_type: 'File'
}

export interface ImageMessage extends BaseMessage {
    text: string,
    file: string,
    message_type: 'Image'
    thumbnail_width?: number,
    thumbnail_height?: number,
    image_thumbnail?: string,
    blurhash?: string
}

export interface TextMessage extends BaseMessage {
    text: string,
    message_type: 'Text',
    content?: string
}

export interface PollMessage extends BaseMessage {
    text: string,
    message_type: 'Poll',
    poll_id: string,
    content?: string
}

export interface SystemMessage extends BaseMessage {
    message_type: 'System',
    text: string,
}

/** Dummy type for UI-only converted-thread preview. Backend shape TBD. */
export interface ConvertedChannelPreview {
    root_message_owner_name?: string
    root_message_owner_image?: string
    root_message_snippet?: string
    message_count?: number
    participants?: { name: string; full_name: string; user_image?: string }[]
    preview_replies?: { owner_name: string; owner_image?: string; snippet?: string }[]
}

/** Dummy type for UI-only forwarded-thread metadata. Backend shape TBD. */
export interface ForwardedThreadMetadata {
    thread_id: string
    source_channel_id: string
    is_source_dm: boolean
    source_workspace: string | null
    title: string
    message_count: number
    root_message_snippet: string
    last_activity: string
    last_message_owner_name: string
    root_message_owner_name?: string
    root_message_owner_image?: string
    participants?: { name: string; full_name: string; user_image?: string }[]
    preview_replies?: { owner_name?: string; owner_image?: string; snippet?: string }[]
}

export type DateBlock = {
    block_type: 'date',
    data: string
}

export type MessageBlock = {
    block_type: 'message',
    data: Message
}

export type MessagesWithDate = (DateBlock | MessageBlock)[]