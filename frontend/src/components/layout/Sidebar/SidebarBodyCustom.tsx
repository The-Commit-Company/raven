import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { useContext, useEffect } from 'react'
import { DirectMessageList } from '../../feature/direct-messages/DirectMessageListCustom'
import CircleUserList from './CircleUserList'
import { useIsTablet } from '@/hooks/useMediaQuery'
import IsTabletSidebarNav from './IsTabletSidebarNav'
import { useSetAtom } from 'jotai'
import { prepareSortedChannels, setSortedChannelsAtom } from '@/utils/channel/ChannelAtom'

export const SidebarBody = () => {
  const { channels, dm_channels } = useContext(ChannelListContext) as ChannelListContextType

  // console.log(channels, dm_channels);

  const setSortedChannels = useSetAtom(setSortedChannelsAtom)
  useEffect(() => {
    if (channels.length === 0 && dm_channels.length === 0) return

    setSortedChannels((prev) => {
      const prevMap = new Map(prev.map((c) => [c.name, c]))

      return prepareSortedChannels(channels, dm_channels).map((channel) => {
        const old = prevMap.get(channel.name)
        return {
          ...channel,
          is_done: old?.is_done ?? channel.is_done ?? 0,
          user_labels: old?.user_labels?.length ? old.user_labels : (channel.user_labels ?? []),
          last_message_content: old?.last_message_content ?? channel.last_message_content,
          last_message_sender_name: old?.last_message_sender_name ?? channel.last_message_sender_name,
          last_message_timestamp: old?.last_message_timestamp ?? channel.last_message_timestamp
        }
      })
    })
  }, [channels, dm_channels, setSortedChannels])

  const isTablet = useIsTablet()

  return (
    <ScrollArea type='hover' scrollbars='vertical' className='h-[calc(100vh-4rem)] sidebar-scroll'>
      <Flex direction='column' gap='2' className='overflow-x-hidden pb-12 sm:pb-0' px='2'>
        <Flex direction='column' gap='1' className='pb-0.5'></Flex>
        {/* <CircleUserList /> */}
        {isTablet && <IsTabletSidebarNav />}
        {/* <PinnedChannels unread_count={unread_count?.message} /> */}
        <DirectMessageList />
      </Flex>
    </ScrollArea>
  )
}
