import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { useContext, useEffect } from 'react'
import { DirectMessageList } from '../../feature/direct-messages/DirectMessageListCustom'
import CircleUserList from './CircleUserList'
import { useIsTablet } from '@/hooks/useMediaQuery'
import IsTabletSidebarNav from './IsTabletSidebarNav'
import { useSetAtom } from 'jotai'
import { prepareSortedChannels, setSortedChannelsAtom, sortedChannelsLoadingAtom } from '@/utils/channel/ChannelAtom'
import BeatLoader from '../Loaders/BeatLoader'

export const SidebarBody = () => {
  const { isLoading, isValidating, channels, dm_channels } = useContext(ChannelListContext) as ChannelListContextType

  const setSortedChannels = useSetAtom(setSortedChannelsAtom)

  const setSortedChannelsLoading = useSetAtom(sortedChannelsLoadingAtom)

  useEffect(() => {
    if (channels.length === 0 && dm_channels.length === 0) return

    setSortedChannelsLoading(true)

    Promise.resolve().then(() => {
      const sorted = prepareSortedChannels(channels, dm_channels)
      setSortedChannels(sorted)
    })
  }, [channels, dm_channels, setSortedChannels, setSortedChannelsLoading])
  const isTablet = useIsTablet()

  if (isLoading || isValidating) return <BeatLoader text='Đang tải danh sách tin nhắn...' />

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
