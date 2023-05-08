export type Message = {
    text: string,
    file: string,
    message_type: string,
    creation: Date,
    name: string,
    owner: string,
    message_reaction: {
        reaction: string,
        user: string
    }[]
}

export type MessageWithContinuationCheck = {
    text: string,
    file: string,
    message_type: string,
    creation: Date,
    name: string,
    owner: string,
    message_reaction: {
        reaction: string,
        user: string
    }[],
    isContinuation: boolean
}