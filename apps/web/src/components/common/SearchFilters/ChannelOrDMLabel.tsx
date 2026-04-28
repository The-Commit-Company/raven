import { useChannels } from '@hooks/useChannels'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@db'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import _ from '@lib/translate'

export function ChannelOrDMLabel({ channelId, parentChannelId }: { channelId?: string, parentChannelId?: string }) {
    const { channels, dm_channels } = useChannels()
    const users = useLiveQuery(() => db.users.toArray(), [])

    const channel = channels.find(c => c.name === channelId) || channels.find(c => c.name === parentChannelId)
    if (channel) {
        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ChannelIcon type={channel.type} className="h-3 w-3" />
                    <span>{channel.channel_name}</span>
                </div>
                <span>•</span>
                <span>{channel.workspace}</span>
            </div>
        )
    }

    const dm = dm_channels.find(c => c.name === channelId)
    if (dm) {
        const peer = users?.find(u => u.name === dm.peer_user_id)
        const peerName = peer?.full_name ?? dm.peer_user_id
        if (!peerName) return null
        return <span className="text-xs text-muted-foreground">{_('Chat with {0}', [peerName])}</span>
    }

    return null
}
