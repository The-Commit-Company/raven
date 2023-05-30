export type Message = FileMessage | TextMessage

export interface BaseMessage {
    name: string,
    owner: string,
    creation: Date,
    message_type: 'Text' | 'File' | 'Image',
    message_reactions?: string | null,
    is_continuation: 1 | 0
}

export interface FileMessage extends BaseMessage {
    file: string,
    message_type: 'File' | 'Image'
}

export interface TextMessage extends BaseMessage {
    text: string,
    message_type: 'Text'
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