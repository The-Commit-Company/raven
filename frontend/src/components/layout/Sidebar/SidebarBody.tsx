import { ChannelList } from '../../feature/channels/ChannelList'
import { DirectMessageList } from '../../feature/direct-messages/DirectMessageList'
import { SidebarItem } from './SidebarComp'
import { AccessibleIcon, Box, Flex, ScrollArea, Text } from '@radix-ui/themes'
import { BiSolidBookmark } from 'react-icons/bi'
import useUnreadMessageCount from '@/hooks/useUnreadMessageCount'
import PinnedChannels from './PinnedChannels'

export const SidebarBody = () => {

    const unread_count = useUnreadMessageCount()

    return (
        <ScrollArea type="hover" scrollbars="vertical" className='h-[calc(100vh-7rem)]'>
            <Flex direction='column' gap='2' className='overflow-x-hidden pb-12 sm:pb-0' px='2'>
                <Flex direction='column' gap='2' className='pb-0.5'>
                    <Box>
                        <SidebarItem to={'saved-messages'} className='py-1'>
                            <AccessibleIcon label='Saved Messages'>
                                <BiSolidBookmark className='text-gray-12 dark:text-gray-300 mt-0.5 sm:text-sm text-base' />
                            </AccessibleIcon>
                            <Box>
                                <Text size={{
                                    initial: '3',
                                    md: '2'
                                }} weight='bold' className='text-gray-12 dark:text-gray-300'>Saved</Text>
                            </Box>
                        </SidebarItem>
                    </Box>
                    <PinnedChannels unread_count={unread_count?.message} />
                </Flex>
                <ChannelList unread_count={unread_count?.message} />
                <DirectMessageList unread_count={unread_count?.message} />
            </Flex>
        </ScrollArea>
    )
}