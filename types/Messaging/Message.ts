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
    is_pinned: 1 | 0,
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

export type DateBlock = {
    block_type: 'date',
    data: string
}

export type MessageBlock = {
    block_type: 'message',
    data: Message
}

export type MessagesWithDate = (DateBlock | MessageBlock)[]