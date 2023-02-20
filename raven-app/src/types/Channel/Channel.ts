export type ChannelData = {
    name: string,
    channel_name: string,
    type: string,
    is_direct_message: number,
    is_self_message: number,
    creation: string,
    owner: string,
    channel_description: string
}

export type DirectMessage = {
    channel_id: string,
    first_name: string,
    full_name: string,
    user_id: string,
    user_image: string,
}