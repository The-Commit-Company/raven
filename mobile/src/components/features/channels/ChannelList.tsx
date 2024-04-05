import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { ChannelListItem, UnreadCountData } from '@/utils/channel/ChannelListProvider'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Heading, Text } from '@radix-ui/themes'

interface ChannelListProps {
    data: ChannelListItem[],
    unread_count?: UnreadCountData
}

export const ChannelList = ({ data, unread_count }: ChannelListProps) => {

    const { channels, unreadChannels } = useMemo(() => {
        if (!data) return { channels: [], unreadChannels: [] }
        if (!unread_count) return { channels: data.map(d => ({ ...d, unreadCount: 0 })), unreadChannels: [] }

        const c = data.map(channel => {
            const unreadCountForChannel = unread_count.channels.find((unread) => unread.name == channel.name)?.unread_count
            return { ...channel, unreadCount: unreadCountForChannel ?? 0 }
        })

        const unreadChannels = c.filter(channel => channel.unreadCount > 0)

        return { channels: c, unreadChannels }
    }, [data, unread_count])

    return (
        <div>
            {unreadChannels?.length > 0 &&
                <div className='pb-2'>
                    <Heading as='h4' className='px-4 py-2 not-cal bg-gray-2' weight='medium' size='2'>Unread</Heading>
                    <ul>
                        {unreadChannels?.map(channel => <ChannelItem
                            channel={channel}
                            unreadCount={channel.unreadCount}
                            key={channel.name} />)}
                    </ul>
                </div>
            }

            <div className='pb-2'>
                {unreadChannels?.length > 0 &&
                    <Heading as='h4' className='px-4 py-2 not-cal bg-gray-2' weight='medium' size='2'>All</Heading>
                }<ul>
                    {channels?.map(channel => <ChannelItem
                        channel={channel}
                        unreadCount={channel.unreadCount}
                        key={channel.name} />)}
                </ul>
            </div>
        </div>

    )
}

const ChannelItem = ({ channel, unreadCount }: { channel: ChannelListItem, unreadCount?: number }) => {

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
                    {unreadCount ? <Badge radius='large' size='2' variant='solid'>{unreadCount < 100 ? unreadCount : '99+'}</Badge> : null}
                </div>
            </Link>
        </li>
    )
}