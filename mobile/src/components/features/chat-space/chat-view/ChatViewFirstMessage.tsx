import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { ChannelListItem, DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Badge, Box, Heading, Strong, Text } from '@radix-ui/themes'
import { BiGlobe, BiHash, BiLock } from 'react-icons/bi'

type Props = {
    channel: ChannelListItem | DMChannelListItem
}

const ChatViewFirstMessage = ({ channel }: Props) => {

    if (channel.is_direct_message) {
        return <DirectMessageHeader channel={channel as DMChannelListItem} />
    } else {
        return <ChannelHeader channel={channel as ChannelListItem} />
    }
}

const ICON_SIZE = '24px'

const parseDateString = (date: string) => {
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const ChannelHeader = ({ channel }: { channel: ChannelListItem }) => {

    const owner = useGetUser(channel.owner)

    return <div className='py-4 px-4'>
        <div className='flex flex-col gap-3'>
            <div className='flex gap-1 items-center'>
                {channel.type === 'Private' ? <BiLock fontSize={ICON_SIZE} /> : channel.type === 'Public' ? <BiHash fontSize={ICON_SIZE} /> : <BiGlobe fontSize={ICON_SIZE} />}
                <div className='flex flex-col gap-0'>
                    <Heading as='h2' size='6' className='tracking-wide'>{channel.channel_name}</Heading>

                </div>
            </div>
            <div className='flex flex-col gap-2'>
                <Text as='p' size='3' weight='medium'>{channel.channel_description}</Text>
                <Text as='p' size='2' color='gray'>{owner?.full_name ?? channel.owner} created this channel on {parseDateString(channel.creation)}.<br /> This is the very beginning of the <Strong>{channel.channel_name}</Strong> channel.</Text>
            </div>
        </div>
    </div>
}

const DirectMessageHeader = ({ channel }: { channel: DMChannelListItem }) => {

    const peer = channel.peer_user_id

    const peerUser = useGetUser(peer)

    if (peer && peerUser) {
        return <div className='py-4 px-2'>
            <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-3'>
                    <UserAvatar src={peerUser.user_image} alt={peerUser.full_name} size='4' isBot={peerUser.type === 'Bot'} />
                    <div className='flex flex-col gap-0'>
                        <Heading size='5' as='h2' className='tracking-wide'>{peerUser.full_name}</Heading>
                        {peerUser.type === 'Bot' ? <Box><Badge color='gray' size='1'>Bot</Badge></Box> :
                            <Text as='p' size='2' color='gray'>{peerUser.name}</Text>
                        }
                    </div>
                </div>
                {channel.is_self_message == 1 ?
                    <div className='flex flex-col gap-2'>
                        <Text as='p' size='2' color='gray'><Strong>This space is all yours.</Strong> Draft messages, list your to-dos, or keep links and files handy. </Text>
                        <Text as='p' size='2' color='gray'>And if you ever feel like talking to yourself, don't worry, we won't judge - just remember to bring your own banter to the table.</Text>
                    </div>
                    :
                    <div className='flex gap-2 items-center'>
                        <Text as='p' size='2' color='gray'>This is a Direct Message channel between you and <Strong>{peerUser.full_name ?? peer}</Strong>.</Text>
                    </div>
                }
            </div>
        </div>
    } else {
        return null
    }


}

export default ChatViewFirstMessage