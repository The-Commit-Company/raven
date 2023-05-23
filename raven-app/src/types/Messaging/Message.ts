export type Message = {
    name: string,
    owner: string,
    creation: Date,
    text: string | null,
    file: string | null,
    message_type: 'Text' | 'File' | 'Image',
    message_reactions?: string | null,
}

export type MessagesWithDate = {
    block_type: string,
    data: any,
}[]
