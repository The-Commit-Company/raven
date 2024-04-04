import { ChannelList } from '../../feature/channels/ChannelList'
import { DirectMessageList } from '../../feature/direct-messages/DirectMessageList'
import { SidebarItem } from './SidebarComp'
import { AccessibleIcon, Box, Flex, ScrollArea, Separator, Text } from '@radix-ui/themes'
import { BiBookmark } from 'react-icons/bi'
import useUnreadMessageCount from '@/hooks/useUnreadMessageCount'
import UnreadChannels from './UnreadChannels'

export const SidebarBody = () => {

    const unread_count = useUnreadMessageCount()

    return (
        <ScrollArea type="hover" scrollbars="vertical" className='h-[calc(100vh-7rem)]'>
            <Flex direction='column' gap='2' className='overflow-x-hidden' px='2'>
                <Box pb='2'>
                    <SidebarItem to={'saved-messages'} className='pl-1.5 py-0.5'>
                        <AccessibleIcon label='Saved Messages'>
                            <BiBookmark className='text-slate-12 mt-0.5' size='14' />
                        </AccessibleIcon>
                        <Box>
                            <Text size='2' className='cal-sans' as='span'>Saved Messages</Text>
                        </Box>
                    </SidebarItem>
                </Box>
                <UnreadChannels unread_count={unread_count?.message} />
                <Box width='100%' py='2'>
                    <Separator size='4' />
                </Box>

                <ChannelList unread_count={unread_count?.message} />
                <DirectMessageList unread_count={unread_count?.message} />
            </Flex>
        </ScrollArea>
    )
}