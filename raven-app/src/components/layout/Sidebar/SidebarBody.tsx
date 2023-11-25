import { Bookmark } from 'lucide-react'
import { ChannelList } from '../../feature/channels/ChannelList'
import { DirectMessageList } from '../../feature/direct-messages/DirectMessageList'
import { SidebarItem, SidebarGroupLabel } from './SidebarComp'
import { useFrappeEventListener, useFrappeGetCall } from 'frappe-react-sdk'
import { UnreadCountData } from '../../../utils/channel/ChannelListProvider'
import { AccessibleIcon, Box, Flex, ScrollArea } from '@radix-ui/themes'

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
                <SidebarItem to={'saved-messages'}>
                    <AccessibleIcon label='Saved Messages'>
                        <Bookmark size='18' />
                    </AccessibleIcon>
                    <Box>
                        <SidebarGroupLabel>Saved Messages</SidebarGroupLabel>
                    </Box>
                </SidebarItem>
                <ChannelList unread_count={unread_count?.message} />
                <DirectMessageList unread_count={unread_count?.message} />
            </Flex>
        </ScrollArea>
    )
}