export type ChannelData = {
    name: string,
    channel_name: string,
    type: 'Private' | 'Public' | 'Open',
    is_direct_message: 1 | 0,
    is_self_message: 1 | 0,
    is_archived: 1 | 0,
    creation: Date,
    owner: string,
    channel_description: string,
    owner_full_name: string,
}

export type DMChannelData = {
    name: string,
    channel_name: string,
    full_name: string,
    user_id: string,
}

export type UnreadCountData = {
    total_unread_count: number,
    channels: { name: string, user_id?: string, unread_count: number }[]
}