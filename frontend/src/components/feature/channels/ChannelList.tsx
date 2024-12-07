import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarItem } from "../../layout/Sidebar/SidebarComp"
import { SidebarBadge, SidebarViewMoreButton } from "../../layout/Sidebar/SidebarComp"
import { CreateChannelButton } from "./CreateChannelModal"
import { useContext, useLayoutEffect, useMemo, useRef, useState } from "react"
import { ChannelListContext, ChannelListContextType } from "../../../utils/channel/ChannelListProvider"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { ContextMenu, Flex, Text } from "@radix-ui/themes"
import { useLocation, useParams } from "react-router-dom"
import { useStickyState } from "@/hooks/useStickyState"
import useCurrentRavenUser from "@/hooks/useCurrentRavenUser"
import { RiPushpinLine, RiUnpinLine } from "react-icons/ri"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { RavenUser } from "@/types/Raven/RavenUser"
import { __ } from "@/utils/translations"
import { ChannelWithUnreadCount } from "@/components/layout/Sidebar/useGetChannelUnreadCounts"

interface ChannelListProps {
    channels: ChannelWithUnreadCount[]
}

export const ChannelList = ({ channels }: ChannelListProps) => {

    const { mutate } = useContext(ChannelListContext) as ChannelListContextType
    const [showData, setShowData] = useStickyState(true, 'expandChannelList')

    const toggle = () => setShowData(d => !d)

    const { myProfile } = useCurrentRavenUser()

    const pinnedChannelIDs = myProfile?.pinned_channels?.map(pin => pin.channel_id)

    // Filter channels based on pinned status
    const filteredChannels = useMemo(() => {
        return channels.filter(channel => !pinnedChannelIDs?.includes(channel.name))
    }, [channels, pinnedChannelIDs])

    const ref = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(ref?.current?.clientHeight ?? showData ? filteredChannels.length * (36) - 4 : 0)

    useLayoutEffect(() => {
        setHeight(ref.current?.clientHeight ?? 0)
    }, [filteredChannels])

    return (
        <SidebarGroup>
            <SidebarGroupItem className={'gap-1 pl-1'}>
                <Flex width='100%' justify='between' align='center' gap='2' pr='2' className="group">
                    <Flex align='center' gap='2' width='100%' onClick={toggle} className="cursor-default select-none">
                        <SidebarGroupLabel>{__("Channels")}</SidebarGroupLabel>
                    </Flex>
                    <Flex align='center' gap='1'>
                        <CreateChannelButton updateChannelList={mutate} />
                        <SidebarViewMoreButton onClick={toggle} expanded={showData} />
                    </Flex>
                </Flex>
            </SidebarGroupItem>
            <SidebarGroup>
                <SidebarGroupList
                    style={{
                        height: showData ? height : 0,
                    }}
                >
                    <div ref={ref} className="flex gap-0.5 flex-col">
                        {filteredChannels.length === 0 ? <Text size='1' className="pl-1" color='gray'>{__("No channels found")}</Text> : null}
                        {filteredChannels.map((channel: ChannelWithUnreadCount) => <ChannelItem
                            channel={channel}
                            key={channel.name} />)}
                    </div>
                </SidebarGroupList>
            </SidebarGroup>
        </SidebarGroup>
    )
}

const ChannelItem = ({ channel }: { channel: ChannelWithUnreadCount }) => {
    return <ChannelItemElement channel={channel} />
}

export const ChannelItemElement = ({ channel }: { channel: ChannelWithUnreadCount }) => {

    const { channelID } = useParams()

    const { state } = useLocation()

    /**
     * Show the unread count if it exists and either the channel is not the current channel,
     * or if it is the current channel, the user is viewing a base message
     */
    const showUnread = channel.unread_count && (channelID !== channel.name || state?.baseMessage)

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger>
                <SidebarItem to={channel.name} className={`py-1.5 px-2.5
                data-[state=open]:bg-gray-3
                `}>
                    <ChannelIcon type={channel.type} size='18' />
                    <Flex justify='between' align={'center'} width='100%'>
                        <Text size={{
                            initial: '3',
                            md: '2'
                        }} className="text-ellipsis line-clamp-1" as='span' weight={showUnread ? 'bold' : 'medium'}>{channel.channel_name}</Text>
                        {showUnread ? <SidebarBadge>{channel.unread_count}</SidebarBadge> : null}
                    </Flex>
                </SidebarItem>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
                <PinButton channelID={channel.name} />
                {/* <ContextMenu.Item>
                    Mute
                </ContextMenu.Item>
                <ContextMenu.Item>
                    Settings
                </ContextMenu.Item> */}
            </ContextMenu.Content>
        </ContextMenu.Root>

    )
}

const PinButton = ({ channelID }: { channelID: string }) => {

    const { myProfile, mutate } = useCurrentRavenUser()

    const isPinned = useMemo(() => {
        if (myProfile) {
            return myProfile.pinned_channels?.map(pin => pin.channel_id).includes(channelID)
        } else {
            return false
        }
    }, [channelID, myProfile])

    const { call } = useContext(FrappeContext) as FrappeConfig

    const onClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
        call.post('raven.api.raven_channel.toggle_pinned_channel', {
            channel_id: channelID
        }).then((res: { message: RavenUser }) => {
            if (res.message) {
                mutate({ message: res.message }, { revalidate: false })
            }
        })
    }

    if (isPinned) {
        return <ContextMenu.Item
            onClick={onClick}
            className='flex justify-start gap-2 min-w-24'
        >
            <RiUnpinLine size='18' />
            {__("Remove Pin")}
        </ContextMenu.Item>
    }
    return <ContextMenu.Item
        onClick={onClick}
        className='flex justify-start gap-2 min-w-24'
    >
        <RiPushpinLine size='18' />
        {__("Pin")}
    </ContextMenu.Item>

}