import { Icon, Stack, useColorMode } from '@chakra-ui/react'
import { IoBookmarkOutline } from 'react-icons/io5'
import { ChannelList } from '../../feature/channels/ChannelList'
import { DirectMessageList } from '../../feature/direct-messages/DirectMessageList'
import { SidebarItem, SidebarGroupLabel } from './SidebarComp'
import { useFrappeEventListener, useFrappeGetCall } from 'frappe-react-sdk'
import { UnreadCountData } from '../../../utils/channel/ChannelListProvider'
import { scrollbarStyles } from '../../../styles'

export const SidebarBody = () => {

    const { data: unread_count, mutate: update_count } = useFrappeGetCall<{ message: UnreadCountData }>("raven.raven_messaging.doctype.raven_message.raven_message.get_unread_count_for_channels",
        undefined,
        'unread_channel_count', {
        // revalidateOnFocus: false,
    })
    useFrappeEventListener('unread_channel_count_updated', () => {
        update_count()
    })

    const { colorMode } = useColorMode()

    return (
        <Stack overflowY='scroll' h={'calc(100vh - 145px)'} px={-2} sx={scrollbarStyles(colorMode)} overflowX='hidden'>
            <SidebarItem to={'saved-messages'}>
                <Icon fontSize={'md'} as={IoBookmarkOutline} />
                <SidebarGroupLabel pl='1'>Saved Messages</SidebarGroupLabel>
            </SidebarItem>
            <ChannelList unread_count={unread_count?.message} />
            <DirectMessageList unread_count={unread_count?.message} />
        </Stack>
    )
}