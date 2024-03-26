import { ChannelList } from '../../feature/channels/ChannelList'
import { DirectMessageList } from '../../feature/direct-messages/DirectMessageList'
import { SidebarItem } from './SidebarComp'
import { AccessibleIcon, Box, Flex, ScrollArea, Text } from '@radix-ui/themes'
import { BiBookmark } from 'react-icons/bi'
import useUnreadMessageCount from '@/hooks/useUnreadMessageCount'

export const SidebarBody = () => {

    const unread_count = useUnreadMessageCount()

    return (
        <ScrollArea type="hover" scrollbars="vertical" className='h-[calc(100vh-7rem)]'>
            <Flex direction='column' gap='2' className='overflow-x-hidden' px='2'>
                <Box>
                    <SidebarItem to={'saved-messages'} className='pl-1.5 py-0.5'>
                        <AccessibleIcon label='Saved Messages'>
                            <BiBookmark className='text-slate-12 mt-0.5' size='14' />
                        </AccessibleIcon>
                        <Box>
                            <Text size='2' className='cal-sans' as='span'>Saved Messages</Text>
                        </Box>
                    </SidebarItem>
                </Box>
                <ChannelList unread_count={unread_count?.message} />
                <DirectMessageList unread_count={unread_count?.message} />
            </Flex>
        </ScrollArea>
    )
}