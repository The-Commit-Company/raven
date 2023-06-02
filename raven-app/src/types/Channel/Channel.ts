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
    owner_full_name: string
}