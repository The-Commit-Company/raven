import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { ChannelListItem, UnreadCountData } from '@/utils/channel/ChannelListProvider'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Text } from '@radix-ui/themes'

interface ChannelListProps {
    data: ChannelListItem[],
    unread_count?: UnreadCountData
}

export const ChannelList = ({ data, unread_count }: ChannelListProps) => {
    return (
        <ul className='pb-4'>
            {data?.map(channel => <ChannelItem
                channel={channel}
                unreadCount={unread_count?.channels ?? []}
                key={channel.name} />)}
        </ul>
    )
}

const ChannelItem = ({ channel, unreadCount }: { channel: ChannelListItem, unreadCount: UnreadCountData['channels'] }) => {

    const unreadCountForChannel = useMemo(() => unreadCount.find((unread) => unread.name == channel.name)?.unread_count, [channel.name, unreadCount])

    return (
        <li key={channel.name} className="list-none">
            <Link to={`/channel/${channel.name}`} className='block px-4 py-2.5 active:bg-accent active:rounded'>
                <div className='flex justify-between items-center text-foreground'>
                    <div className='flex items-center space-x-2'>
                        <div>
                            {channel.type === "Private" ? <BiLockAlt size='20' /> : channel.type === "Public" ? <BiHash size='20' /> :
                                <BiGlobe size='20' />}
                        </div>
                        <Text size='3' weight='medium'>{channel.channel_name}</Text>
                    </div>
                    {unreadCountForChannel ? <Badge radius='large' size='2' variant='solid'>{unreadCountForChannel < 100 ? unreadCountForChannel : '99'}</Badge> : null}
                </div>
            </Link>
        </li>
    )
}