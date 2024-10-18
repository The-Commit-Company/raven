import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList } from "../../layout/Sidebar/SidebarComp";
import { ChannelItemElement } from '@/components/feature/channels/ChannelList';
import { DirectMessageItemElement } from '../../feature/direct-messages/DirectMessageList';
import { __ } from '@/utils/translations';
import { useStickyState } from "@/hooks/useStickyState";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { SidebarBadge, SidebarViewMoreButton } from "@/components/layout/Sidebar/SidebarComp";
import { Box, DropdownMenu, Flex, IconButton } from "@radix-ui/themes";
import { ChannelWithUnreadCount, DMChannelWithUnreadCount } from "@/components/layout/Sidebar/useGetChannelUnreadCounts";
import clsx from "clsx";
import { UnreadCountData } from "@/utils/channel/ChannelListProvider";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { useFrappePostCall, useSWRConfig } from "frappe-react-sdk";
import { toast } from "sonner";

interface UnreadListProps {
    unreadChannels: ChannelWithUnreadCount[]
    unreadDMs: DMChannelWithUnreadCount[]
}

export const UnreadList = ({ unreadChannels, unreadDMs }: UnreadListProps) => {

    const [showData, setShowData] = useStickyState(true, 'expandDirectMessageList')

    const toggle = () => setShowData(d => !d)

    const ref = useRef<HTMLDivElement>(null)

    const [height, setHeight] = useState(ref?.current?.clientHeight ?? showData ? (unreadDMs.length + unreadChannels.length) * (36) - 4 : 0)

    useLayoutEffect(() => {
        setHeight(ref.current?.clientHeight ?? 0)
    }, [unreadDMs, unreadChannels])

    const { totalUnreadCount, channelIDs } = useMemo(() => {
        let totalUnreadCount = 0
        let channelIDs = []

        // Count unread messages from channels
        for (const channel of unreadChannels) {
            if (channel.is_archived == 0) {
                totalUnreadCount += channel.unread_count || 0
                channelIDs.push(channel.name)
            }
        }

        // Count unread messages from DMs
        for (const dm of unreadDMs) {
            totalUnreadCount += dm.unread_count || 0
            channelIDs.push(dm.name)
        }

        return { totalUnreadCount, channelIDs }
    }, [unreadChannels, unreadDMs])

    return (
        <SidebarGroup>
            <SidebarGroupItem className={'gap-1 pl-1'}>
                <Flex width='100%' justify='between' align='center' gap='2' pr='2' className="group">
                    <Flex align='center' gap='2' width='100%' onClick={toggle} className="cursor-default select-none">
                        <SidebarGroupLabel>{__("Unread")}</SidebarGroupLabel>
                        <Box className={clsx('transition-opacity ease-in-out duration-200',
                            !showData && totalUnreadCount > 0 ? 'opacity-100' : 'opacity-0')}>
                            <SidebarBadge>
                                {totalUnreadCount}
                            </SidebarBadge>
                        </Box>
                    </Flex>
                    <Flex align='center' gap='1'>
                        <UnreadSectionActions channelIDs={channelIDs} />
                        <SidebarViewMoreButton onClick={toggle} expanded={showData} />
                    </Flex>
                </Flex>
            </SidebarGroupItem>
            <SidebarGroupList
                style={{
                    height: showData ? height : 0
                }}>
                <div ref={ref} className="flex gap-1 flex-col fade-in">
                    {/* Render unread DMs */}
                    {unreadDMs.map(dm => (
                        <DirectMessageItemElement
                            key={dm.name}
                            channel={dm}
                        />
                    ))}
                    {/* Render unread channels */}
                    {unreadChannels.map(channel => (
                        <ChannelItemElement
                            key={channel.name}
                            channel={channel}
                        />
                    ))}
                </div>
            </SidebarGroupList>
        </SidebarGroup>
    )
}

const UnreadSectionActions = ({ channelIDs }: { channelIDs: string[] }) => {

    const { mutate } = useSWRConfig()

    const [isOpen, setIsOpen] = useState(false)
    const { call } = useFrappePostCall('raven.api.raven_channel.mark_all_messages_as_read')
    const handleMarkAllAsRead = () => {
        call({
            channel_ids: channelIDs
        }).then(() => {
            toast.success('All messages marked as read')
            mutate('unread_channel_count', (d: { message: UnreadCountData } | undefined) => {
                if (d?.message) {
                    // Update all channels with unread count as 0
                    const newChannels = d.message.channels.map(c => {
                        if (c.name && channelIDs.includes(c.name)) {
                            return {
                                ...c,
                                unread_count: 0
                            }
                        }
                        return c
                    })

                    const total_unread_count_in_channels = newChannels.reduce((acc: number, c) => {
                        if (!c.is_direct_message) {
                            return acc + c.unread_count
                        } else {
                            return acc
                        }
                    }, 0)

                    const total_unread_count_in_dms = newChannels.reduce((acc: number, c) => {
                        if (c.is_direct_message) {
                            return acc + c.unread_count
                        } else {
                            return acc
                        }
                    }, 0)

                    return {
                        message: {
                            total_unread_count_in_channels,
                            total_unread_count_in_dms,
                            channels: newChannels
                        }
                    }
                }
            }, {
                revalidate: false
            })
        }).catch(() => {
            toast.error('Failed to mark all messages as read')
        })
        setIsOpen(false)
    }

    return (
        <DropdownMenu.Root onOpenChange={(open) => setIsOpen(open)}>
            <DropdownMenu.Trigger>
                <IconButton
                    aria-label={__("Options")}
                    title={__("Options")}
                    variant="soft"
                    size="1"
                    radius="large"
                    className={clsx(
                        'cursor-pointer transition-all text-gray-10 dark:text-gray-300 bg-transparent',
                        'sm:hover:bg-gray-3',
                        {
                            'sm:invisible sm:group-hover:visible': !isOpen,
                            'sm:visible': isOpen, // Ensure it's visible when the dropdown is open
                        },
                        'ease-ease',
                        'outline-none'
                    )}>
                    <BiDotsVerticalRounded />
                </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item onClick={handleMarkAllAsRead}>Mark all as read</DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}