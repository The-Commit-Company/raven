import { useIsTablet } from '@/hooks/useMediaQuery'
import { prepareSortedChannels, setSortedChannelsAtom } from '@/utils/channel/ChannelAtom'
import { channelIsDoneAtom } from '@/utils/channel/channelIsDoneAtom'
import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { useAtomValue, useSetAtom } from 'jotai'
import { useContext, useEffect } from 'react'
import { DirectMessageList } from '../../feature/direct-messages/DirectMessageListCustom'
import IsTabletSidebarNav from './IsTabletSidebarNav'
// import BeatLoader from '../Loaders/BeatLoader'

export const SidebarBody = () => {
  const { channels, dm_channels } = useContext(ChannelListContext) as ChannelListContextType

  const setSortedChannels = useSetAtom(setSortedChannelsAtom)

  const currentChannelIsDone = useAtomValue(channelIsDoneAtom)

  useEffect(() => {
    if (channels?.length === 0 && dm_channels?.length === 0) return

    const sorted = prepareSortedChannels(channels, dm_channels, currentChannelIsDone)
    setSortedChannels(sorted)
  }, [channels, dm_channels, setSortedChannels, currentChannelIsDone])

  const isTablet = useIsTablet()

  // const isLoaded = !isLoading && !isValidating

  // if (!isLoaded) return <BeatLoader text='Đang tải danh sách tin nhắn...' />

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
