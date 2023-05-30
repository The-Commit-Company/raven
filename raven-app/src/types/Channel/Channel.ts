export type ChannelData = {
    name: string,
    channel_name: string,
    type: 'Private' | 'Public' | 'Open',
    is_direct_message: number,
    is_self_message: number,
    is_archived: number,
    creation: Date,
    owner: string,
    channel_description: string,
    owner_full_name: string
}