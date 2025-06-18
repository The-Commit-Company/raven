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
  const setSortedChannels = useSetAtom(setSortedChannelsAtom)
  useEffect(() => {
    setSortedChannels((prev) => {
      const prevMap = new Map(prev.map((c) => [c.name, c.is_done]))
      const nextList = prepareSortedChannels(channels, dm_channels).map((channel) => ({
        ...channel,
        is_done: prevMap.get(channel.name) ?? channel.is_done ?? 0
      }))
      return nextList
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
