export type Message = {
    text: string,
    file: string,
    message_type: string,
    creation: Date,
    name: string,
    owner: string
}

export type MessageWithContinuationCheck = {
    text: string,
    file: string,
    message_type: string,
    creation: Date,
    name: string,
    owner: string,
    isContinuation: boolean
}