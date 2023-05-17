export type Message = {
    name: string,
    owner: string,
    creation: Date,
    text: string | null,
    file: string | null,
    message_type: 'Text' | 'File' | 'Image',
    message_reactions: string | null,
    isContinuation: boolean | null
}

export type MessagesWithDate = {
    [date: string]: Message[]
}