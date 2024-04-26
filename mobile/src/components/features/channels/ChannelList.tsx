import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { ChannelListItem, UnreadCountData } from '@/utils/channel/ChannelListProvider'
import { useContext, useMemo, useRef } from 'react'
import { Badge, Box, Text } from '@radix-ui/themes'
import { IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonList } from '@ionic/react'
import { RiPushpinLine, RiUnpinLine } from 'react-icons/ri'
import useCurrentRavenUser from '@/hooks/useCurrentRavenUser'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { RavenUser } from '@/types/Raven/RavenUser'

interface ChannelListProps {
    data: ChannelListItem[],
    unread_count?: UnreadCountData
}

export const ChannelList = ({ data, unread_count }: ChannelListProps) => {

    const { myProfile } = useCurrentRavenUser()

    const { channels } = useMemo(() => {
        if (!data) return { channels: [] }

        const pinnedChannelIDs = myProfile?.pinned_channels?.map(pin => pin.channel_id)

        const channelList = []

        for (const channel of data) {
            if (channel.is_archived == 1) continue
            const isPinned = pinnedChannelIDs?.includes(channel.name) ?? false
            const unreadCountForChannel = unread_count?.channels.find((unread) => unread.name == channel.name)?.unread_count ?? 0

            channelList.push({
                ...channel,
                isPinned,
                unreadCount: unreadCountForChannel
            })
        }

        // Sort the channel list by pinned channels first
        const pinnedChannels = channelList.filter(channel => channel.isPinned)
        const unpinnedChannels = channelList.filter(channel => !channel.isPinned)

        return { channels: [...pinnedChannels, ...unpinnedChannels] }

    }, [data, unread_count, myProfile])

    return (
        <div className='pb-2'>
            <IonList>
                {channels?.map(channel => <ChannelItem
                    channel={channel}
                    unreadCount={channel.unreadCount}
                    key={channel.name} />)}
            </IonList>
        </div>
    )
}

interface ChannelListItemWithPinned extends ChannelListItem {
    isPinned: boolean
}

const ChannelItem = ({ channel, unreadCount }: { channel: ChannelListItemWithPinned, unreadCount?: number }) => {

    const ref = useRef<HTMLIonItemSlidingElement>(null)

    const close = () => {
        ref.current?.close()
    }

    return (
        <IonItemSliding ref={ref}>
            <IonItemOptions side='start'>
                <PinAction channelID={channel.name} isPinned={channel.isPinned} onComplete={close} />
            </IonItemOptions>
            <IonItem
                routerLink={`/channel/${channel.name}`}
                detail={false}
                // lines='none'
                className='block'>
                <div className='flex justify-between w-full items-center text-foreground'>
                    <div className='flex items-center space-x-2'>
                        <div>
                            {channel.type === "Private" ? <BiLockAlt size='20' /> : channel.type === "Public" ? <BiHash size='20' /> :
                                <BiGlobe size='20' />}
                        </div>
                        <Text size='3' weight='medium'>{channel.channel_name}</Text>
                    </div>
                    {unreadCount ? <Badge radius='large' size='2' variant='solid'>{unreadCount < 100 ? unreadCount : '99+'}</Badge> :
                        channel.isPinned ? <Box><RiPushpinLine size='16' className='text-gray-9' /></Box> : null
                    }
                </div>
            </IonItem>


        </IonItemSliding>

    )
}

const PinAction = ({ channelID, isPinned, onComplete }: { channelID: string, isPinned: boolean, onComplete: VoidFunction }) => {

    const { mutate } = useCurrentRavenUser()

    const { call } = useContext(FrappeContext) as FrappeConfig

    const onClick: React.MouseEventHandler<HTMLIonItemOptionElement> = (e) => {
        call.post('raven.api.raven_channel.toggle_pinned_channel', {
            channel_id: channelID
        }).then((res: { message: RavenUser }) => {
            if (res.message) {
                mutate({ message: res.message }, { revalidate: false })
            }
        })
        onComplete()
    }
    return <IonItemOption onClick={onClick}>
        <div className='flex gap-2'>
            {isPinned ? <RiUnpinLine size='20' /> : <RiPushpinLine size='20' />}
            {isPinned ? 'Unpin' : 'Pin'}
        </div>
    </IonItemOption>
}