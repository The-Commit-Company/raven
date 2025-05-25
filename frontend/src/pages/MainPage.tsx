import { Flex, Box } from '@radix-ui/themes'
import { Outlet, useParams } from 'react-router-dom'
import { lazy, Suspense, useContext, useEffect } from 'react'
import { Sidebar } from '../components/layout/Sidebar/Sidebar'
import { ChannelListProvider } from '../utils/channel/ChannelListProvider'
import { UserListProvider } from '@/utils/users/UserListProvider'
import { hasRavenUserRole } from '@/utils/roles'
import { FullPageLoader } from '@/components/layout/Loaders/FullPageLoader'
import CommandMenu from '@/components/feature/CommandMenu/CommandMenu'
import { useFetchActiveUsersRealtime } from '@/hooks/fetchers/useFetchActiveUsers'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { showNotification } from '@/utils/pushNotifications'
import MessageActionController from '@/components/feature/message-actions/MessageActionController'
import { useActiveSocketConnection } from '@/hooks/useActiveSocketConnection'
import { useFrappeEventListener, useSWRConfig } from 'frappe-react-sdk'
import { useUnreadThreadsCountEventListener } from '@/hooks/useUnreadThreadsCount'
import { UserContext } from '@/utils/auth/UserProvider'
import { SidebarModeProvider } from '@/utils/layout/sidebar'
import { CircleUserListProvider } from '@/utils/users/CircleUserListProvider'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { HStack } from '@/components/layout/Stack'

const AddRavenUsersPage = lazy(() => import('@/pages/AddRavenUsersPage'))

export const MainPage = () => {
  const isRavenUser = hasRavenUserRole()
  if (isRavenUser) {
    return <MainPageContent />
  } else {
    // If the user does not have the Raven User role, then show an error message if the user cannot add more people.
    // Else, show the page to add people to Raven
    return (
      <Suspense fallback={<FullPageLoader />}>
        <AddRavenUsersPage />
      </Suspense>
    )
  }
}

const MainPageContent = () => {
  const { currentUser } = useContext(UserContext)

  useFetchActiveUsersRealtime()

  useEffect(() => {
    //@ts-expect-error
    window?.frappePushNotification?.onMessage((payload) => {
      showNotification(payload)
    })
  }, [])

  const isMobile = useIsMobile()

  useActiveSocketConnection()

  // Listen to channel members updated events and invalidate the channel members cache
  const { mutate } = useSWRConfig()

  useFrappeEventListener('channel_members_updated', (payload) => {
    mutate(['channel_members', payload.channel_id])
  })

  const onThreadReplyEvent = useUnreadThreadsCountEventListener()

  const { threadID } = useParams()

  // Listen to realtime event for new message count
  useFrappeEventListener('thread_reply', (event) => {
    if (event.channel_id) {
      mutate(
        ['thread_reply_count', event.channel_id],
        {
          message: event.number_of_replies
        },
        {
          revalidate: false
        }
      )

      // Dispatch a custom event that ThreadsList can listen to if it's mounted
      window.dispatchEvent(
        new CustomEvent('thread_updated', {
          detail: {
            threadId: event.channel_id,
            sentBy: event.sent_by,
            lastMessageTimestamp: event.last_message_timestamp,
            numberOfReplies: event.number_of_replies
          }
        })
      )
    }

    // Unread count only needs to be fetched for certain conditions

    // Ignore the event if the message is sent by the current user
    if (event.sent_by === currentUser) return

    // Ignore the event if the message is in the current open thread
    if (threadID === event.channel_id) return

    onThreadReplyEvent(event.channel_id)
  })

  return (
    <UserListProvider>
      <ChannelListProvider>
        <SidebarModeProvider>
          <CircleUserListProvider>
           <HStack>
             <PanelGroup direction='horizontal' className='flex-1 flex'>
              {/* Panel trái - Sidebar */}
              {!isMobile && (
                <Panel minSize={20} defaultSize={30}>
                  <div className='h-screen w-full bg-gray-2 border-r border-gray-3 dark:bg-gray-1'>
                    <Sidebar />
                  </div>
                </Panel>
              )}

              {!isMobile && <PanelResizeHandle className='cursor-col-resize' />}

              {/* Panel phải - Nội dung chính */}
              <Panel minSize={40} defaultSize={70}>
                <div className='h-screen w-full dark:bg-gray-2'>
                  <Outlet />
                </div>
              </Panel>
            </PanelGroup>
           </HStack>
          </CircleUserListProvider>
        </SidebarModeProvider>
        <CommandMenu />
        <MessageActionController />
      </ChannelListProvider>
    </UserListProvider>
  )
}
