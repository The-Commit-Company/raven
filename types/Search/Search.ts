export interface GetFileSearchResult {
    channel_id: string
    creation: string
    file: string
    message_type: string
    name: string
    owner: string
}

export interface GetChannelSearchResult {
    type: "Private" | "Public" | "Open"
    name: string
    channel_name: string
    is_archived: 1 | 0
}