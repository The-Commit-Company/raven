import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { atomWithStorage } from 'jotai/utils'
import { useContext, useMemo } from 'react'
import { DirectMessageList } from '../../feature/direct-messages/DirectMessageListCustom'
import CircleUserList from './CircleUserList'

export const showOnlyMyChannelsAtom = atomWithStorage('showOnlyMyChannels', false)

export type SidebarBodyProps = {
  size: number
}

export const SidebarBody = ({ size }: SidebarBodyProps) => {
  // const unread_count = useFetchUnreadMessageCount()
  const { channels, dm_channels } = useContext(ChannelListContext) as ChannelListContextType

  // const { workspaceID } = useParams()

  // const workspaceChannels = useMemo(() => {
  //   return channels.filter((channel) => channel.workspace === workspaceID)
  // }, [channels, workspaceID])

  // const { unreadChannels, readChannels, unreadDMs, readDMs } = useGetChannelUnreadCounts({
  //   channels: workspaceChannels,
  //   dm_channels,
  //   unread_count: unread_count?.message
  // })

  const sortedChannels = useMemo(() => {
    return [
      ...channels.map((channel) => ({ ...channel, group_type: 'channel' })),
      ...dm_channels.map((dm) => ({ ...dm, group_type: 'dm' }))
    ].sort((a, b) => {
      const timeA = new Date(a.last_message_timestamp || 0).getTime()
      const timeB = new Date(b.last_message_timestamp || 0).getTime()
      return timeB - timeA
    })
  }, [channels, dm_channels])


  return (
    <ScrollArea type='hover' scrollbars='vertical' className='h-[calc(100vh-4rem)] sidebar-scroll'>
      <Flex direction='column' gap='2' className='overflow-x-hidden pb-12 sm:pb-0' px='2'>
        <Flex direction='column' gap='1' className='pb-0.5'></Flex>
        <CircleUserList size={size} />
        {/* <PinnedChannels unread_count={unread_count?.message} /> */}
        <DirectMessageList dm_channels={sortedChannels} />
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
