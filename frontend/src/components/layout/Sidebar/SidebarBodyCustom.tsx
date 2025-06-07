import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { useContext, useEffect, useMemo } from 'react'
import { DirectMessageList } from '../../feature/direct-messages/DirectMessageListCustom'
import CircleUserList from './CircleUserList'
import { useIsTablet } from '@/hooks/useMediaQuery'
import IsTabletSidebarNav from './IsTabletSidebarNav'
import { useAtomValue, useSetAtom } from 'jotai'
import { prepareSortedChannels, sortedChannelsAtom } from '@/utils/channel/ChannelAtom'

export type SidebarBodyProps = {
  size: number
}

export const SidebarBody = ({ size }: SidebarBodyProps) => {
  const { channels, dm_channels } = useContext(ChannelListContext) as ChannelListContextType
  const setSortedChannels = useSetAtom(sortedChannelsAtom)
  useEffect(() => {
    setSortedChannels(prepareSortedChannels(channels, dm_channels))
  }, [channels, dm_channels, setSortedChannels])

  const isTablet = useIsTablet()

  // const { workspaceID } = useParams()

  // const workspaceChannels = useMemo(() => {
  //   return channels.filter((channel) => channel.workspace === workspaceID)
  // }, [channels, workspaceID])

  // const { unreadChannels, readChannels, unreadDMs, readDMs } = useGetChannelUnreadCounts({
  //   channels: workspaceChannels,
  //   dm_channels,
  //   unread_count: unread_count?.message
  // })

  return (
    <ScrollArea type='hover' scrollbars='vertical' className='h-[calc(100vh-4rem)] sidebar-scroll'>
      <Flex direction='column' gap='2' className='overflow-x-hidden pb-12 sm:pb-0' px='2'>
        <Flex direction='column' gap='1' className='pb-0.5'></Flex>
        <CircleUserList />
        {isTablet && <IsTabletSidebarNav />}
        {/* <PinnedChannels unread_count={unread_count?.message} /> */}
        <DirectMessageList />
      </Flex>
    </ScrollArea>
  )
}

// const ThreadsButton = () => {
//   const { threadID } = useParams()

//   const { data: unreadThreads } = useUnreadThreadsCount()

//   const totalUnreadThreads = useMemo(() => {
//     // Need to remove the current thread ID from the unread threads if it exists. The current thread is not included in the unread threads since the user is already on the thread
//     return unreadThreads?.message.filter((t) => t.name !== threadID).length || 0
//   }, [unreadThreads, threadID])

//   return (
//     <SidebarItemForPage
//       to={'threads'}
//       label='Threads'
//       unreadCount={totalUnreadThreads}
//       icon={<BiMessageAltDetail className='text-gray-12 dark:text-gray-300 mt-1 sm:text-sm text-base' />}
//       iconLabel='Threads'
//     />
//   )
// }

// interface SidebarItemForPageProps {
//   to: string
//   label: string
//   icon: React.ReactNode
//   iconLabel: string
//   unreadCount?: number
// }

// const SidebarItemForPage = ({ to, label, icon, iconLabel, unreadCount }: SidebarItemForPageProps) => {
//   return (
//     <Box>
//       <SidebarItem to={to} className='py-1 px-[10px] flex items-center justify-between'>
//         <div className='flex items-center gap-2'>
//           <AccessibleIcon label={__(iconLabel)}>{icon}</AccessibleIcon>
//           <Box>
//             <Text
//               size={{
//                 initial: '3',
//                 md: '2'
//               }}
//               className='text-gray-12 dark:text-gray-300 font-semibold'
//             >
//               {__(label)}
//             </Text>
//           </Box>
//         </div>

//         {unreadCount && unreadCount > 0 ? <SidebarBadge>{unreadCount}</SidebarBadge> : null}
//       </SidebarItem>
//     </Box>
//   )
// }
