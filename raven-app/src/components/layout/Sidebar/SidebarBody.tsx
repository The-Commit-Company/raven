import { BiBookmark } from 'react-icons/bi'
import { ChannelList } from '../../feature/channels/ChannelList'
import { DirectMessageList } from '../../feature/direct-messages/DirectMessageList'
import { SidebarItem, SidebarGroupLabel, SidebarIcon } from './SidebarComp'
import { useFrappeEventListener, useFrappeGetCall } from 'frappe-react-sdk'
import { UnreadCountData } from '../../../utils/channel/ChannelListProvider'
import { AccessibleIcon, Box, Flex, ScrollArea, Text } from '@radix-ui/themes'

export const SidebarBody = () => {

    const { data: unread_count, mutate: update_count } = useFrappeGetCall<{ message: UnreadCountData }>("raven.raven_messaging.doctype.raven_message.raven_message.get_unread_count_for_channels",
        undefined,
        'unread_channel_count', {
        // revalidateOnFocus: false,
    })
    useFrappeEventListener('raven:unread_channel_count_updated', () => {
        update_count()
    })

    return (
        <ScrollArea type="hover" scrollbars="vertical" className='h-[calc(100vh-7rem)]'>
            <Flex direction='column' gap='2' className='overflow-x-hidden' px='2'>
                <Box pr='1'>
                    <SidebarItem to={'saved-messages'} className='pl-1'>
                        <AccessibleIcon label='Saved Messages'>
                            <BiBookmark size='16' className='text-[var(--gray-10)]' />
                        </AccessibleIcon>
                        <Box>
                            <Text size='2' className="cal-sans" as='span'>Saved Messages</Text>
                        </Box>
                    </SidebarItem>
                </Box>
                <ChannelList unread_count={unread_count?.message} />
                <DirectMessageList unread_count={unread_count?.message} />
            </Flex>
        </ScrollArea>
    )
}