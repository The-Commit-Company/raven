import { RavenChannel } from "@raven/types/RavenChannelManagement/RavenChannel";

export type ChannelListItem = Pick<RavenChannel, 'name' | 'channel_name' | 'type' |
    'channel_description' | 'is_direct_message' | 'is_self_message' |
    'is_archived' | 'creation' | 'owner' | 'last_message_details' | 'last_message_timestamp' | 'workspace'>

export interface DMChannelListItem extends ChannelListItem {
    peer_user_id: string,
    is_direct_message: 1,
}

export interface ChannelList {
    channels: ChannelListItem[],
    dm_channels: DMChannelListItem[]
}
