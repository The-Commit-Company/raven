export interface GetFileSearchResult {
    channel_id: string
    creation: string
    file: string
    message_type: string
    name: string
    owner: string
}

export interface GetMessageSearchResult {
    channel_id: string
    creation: Date
    text: string
    name: string
    owner: string
}

export interface GetChannelSearchResult {
    type: string
    name: string
    channel_name: string
    is_archived: number
}