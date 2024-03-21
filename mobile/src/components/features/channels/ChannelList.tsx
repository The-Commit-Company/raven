import { IonBadge } from '@ionic/react'
import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { ChannelListItem, UnreadCountData } from '@/utils/channel/ChannelListProvider'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface ChannelListProps {
    data: ChannelListItem[],
    unread_count?: UnreadCountData
}

export const ChannelList = ({ data, unread_count }: ChannelListProps) => {
    return (
        <div className='pb-4'>
            {data?.map(channel => <ChannelItem
                channel={channel}
                unreadCount={unread_count?.channels ?? []}
                key={channel.name} />)}
        </div>
    )
}

const ChannelItem = ({ channel, unreadCount }: { channel: ChannelListItem, unreadCount: UnreadCountData['channels'] }) => {

    const unreadCountForChannel = useMemo(() => unreadCount.find((unread) => unread.name == channel.name)?.unread_count, [channel.name, unreadCount])

    return (
        <li key={channel.name} className="list-none px-4 py-3">
            <Link to={`/channel/${channel.name}`}>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center space-x-4 w-5/6'>
                        <div>
                            {channel.type === "Private" ? <BiLockAlt size='24' /> : channel.type === "Public" ? <BiHash size='24' /> :
                                <BiGlobe size='24' className='text-foreground' />}
                        </div>
                        <Label className='text-foreground'>{channel.channel_name}</Label>
                    </div>
                    {unreadCountForChannel ? <Badge>{unreadCountForChannel < 100 ? unreadCountForChannel : '99'}</Badge> : null}
                </div>
            </Link>
        </li>
    )
}