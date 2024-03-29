import { CustomAvatar } from '@/components/ui/avatar'
import { useGetUser } from '@/hooks/useGetUser'
import { ChannelListItem, DMChannelListItem } from '@/utils/channel/ChannelListProvider'
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

    return <div className='py-4 px-2'>
        <div className='flex flex-col gap-3'>
            <div className='flex gap-1 items-center'>
                {channel.type === 'Private' ? <BiLock fontSize={ICON_SIZE} /> : channel.type === 'Public' ? <BiHash fontSize={ICON_SIZE} /> : <BiGlobe fontSize={ICON_SIZE} />}
                <div className='flex flex-col gap-0'>
                    <h2 className='cal-sans text-2xl font-normal tracking-wide text-white'>{channel.channel_name}</h2>

                </div>
            </div>
            <div className='flex flex-col gap-2'>
                <p className='text-lg font-medium text-zinc-100'>{channel.channel_description}</p>
                <p className='text-md text-zinc-400'>{owner?.full_name ?? channel.owner} created this channel on {parseDateString(channel.creation)}.<br /> This is the very beginning of the <strong>{channel.channel_name}</strong> channel.</p>

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
                <div className='flex gap-2'>
                    <CustomAvatar alt={peerUser.full_name} src={peerUser.user_image} sizeClass='w-12 h-12'/>
                    <div className='flex flex-col gap-0'>
                        <h2 className='cal-sans text-xl font-normal tracking-wide text-white'>{peerUser.full_name}</h2>
                        <p className='text-sm text-zinc-300'>{peerUser.name}</p>
                    </div>
                </div>
                {channel.is_self_message == 1 ?
                    <div className='flex flex-col gap-2'>
                        <p className='text-md text-zinc-300'><strong>This space is all yours.</strong> Draft messages, list your to-dos, or keep links and files handy. </p>
                        <p className='text-md text-zinc-300'>And if you ever feel like talking to yourself, don't worry, we won't judge - just remember to bring your own banter to the table.</p>
                    </div>
                    :
                    <div className='flex gap-2 items-center'>
                        <p className='text-md text-zinc-300'>This is a Direct Message channel between you and <strong>{peerUser.full_name ?? peer}</strong>.</p>
                    </div>
                }
            </div>
        </div>
    } else {
        return null
    }


}

export default ChatViewFirstMessage