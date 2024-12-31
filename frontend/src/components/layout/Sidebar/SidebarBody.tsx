import { ChannelList } from '../../feature/channels/ChannelList'
import { DirectMessageList } from '../../feature/direct-messages/DirectMessageList'
import { SidebarItem } from './SidebarComp'
import { AccessibleIcon, Box, Flex, ScrollArea, Text } from '@radix-ui/themes'
import useUnreadMessageCount from '@/hooks/useUnreadMessageCount'
import PinnedChannels from './PinnedChannels'
import React, { useContext, useMemo } from 'react'
import { BiBookmark, BiMessageAltDetail } from 'react-icons/bi'
import { __ } from '@/utils/translations'
import { UnreadList } from '@/components/feature/channel-groups/UnreadList'
import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'
import { useGetChannelUnreadCounts } from './useGetChannelUnreadCounts'
import { useParams } from 'react-router-dom'

export const SidebarBody = () => {

    const unread_count = useUnreadMessageCount()
    const { channels, dm_channels } = useContext(ChannelListContext) as ChannelListContextType

    const { workspaceID } = useParams()

    const workspaceChannels = useMemo(() => {
        return channels.filter((channel) => channel.workspace === workspaceID)
    }, [channels, workspaceID])

    const { unreadChannels, readChannels, unreadDMs, readDMs } = useGetChannelUnreadCounts({
        channels: workspaceChannels,
        dm_channels,
        unread_count: unread_count?.message
    })

    return (
        <ScrollArea type="hover" scrollbars="vertical" className='h-[calc(100vh-4rem)]'>
            <Flex direction='column' gap='2' className='overflow-x-hidden pb-12 sm:pb-0' px='2'>
                <Flex direction='column' gap='1' className='pb-0.5'>
                    <SidebarItemForPage
                        to={'threads'}
                        label='Threads'
                        icon={<BiMessageAltDetail className='text-gray-12 dark:text-gray-300 mt-1 sm:text-sm text-base' />}
                        iconLabel='Threads' />
                    <SidebarItemForPage
                        to={'saved-messages'}
                        label='Saved'
                        icon={<BiBookmark className='text-gray-12 dark:text-gray-300 mt-0.5 sm:text-sm text-base' />}
                        iconLabel='Saved Message' />
                    <PinnedChannels unread_count={unread_count?.message} />
                </Flex>
                {(unreadChannels.length > 0 || unreadDMs.length > 0) && <UnreadList unreadChannels={unreadChannels} unreadDMs={unreadDMs} />}
                <ChannelList channels={readChannels} />
                <DirectMessageList dm_channels={readDMs} />
            </Flex>
        </ScrollArea>
    )
}

interface SidebarItemForPageProps {
    to: string
    label: string
    icon: React.ReactNode
    iconLabel: string
}

const SidebarItemForPage = ({ to, label, icon, iconLabel }: SidebarItemForPageProps) => {
    return (
        <Box>
            <SidebarItem to={to} className='py-1 px-[10px]'>
                <AccessibleIcon label={__(iconLabel)}>
                    {icon}
                </AccessibleIcon>
                <Box>
                    <Text size={{
                        initial: '3',
                        md: '2'
                    }} className='text-gray-12 dark:text-gray-300 font-semibold'>{__(label)}</Text>
                </Box>
            </SidebarItem>
        </Box>
    )
}