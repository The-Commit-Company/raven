import { Flex, Box } from '@radix-ui/themes'
import { Outlet, useParams } from 'react-router-dom'
import { lazy, Suspense, useContext, useEffect, useRef, useState } from 'react'
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
import { SidebarModeProvider, useSidebarMode } from '@/utils/layout/sidebar'
import { CircleUserListProvider } from '@/utils/users/CircleUserListProvider'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { HStack } from '@/components/layout/Stack'
import { SidebarHeader } from '@/components/layout/Sidebar/SidebarHeader'
import { SidebarBody } from '@/components/layout/Sidebar/SidebarBodyCustom'
import WorkspacesSidebar from '@/components/layout/Sidebar/WorkspacesSidebar'
import SidebarContainer from '@/components/layout/Sidebar/SidebarContainer'
import { useSidebarResizeLogic } from '@/components/layout/Sidebar/useSidebarResizeLogic'

const AddRavenUsersPage = lazy(() => import('@/pages/AddRavenUsersPage'))

export const MainPageCustom = () => {
  const isRavenUser = hasRavenUserRole()
  if (isRavenUser) {
    return (
      <ChannelListProvider>
        <SidebarModeProvider>
          <MainPageContent />
        </SidebarModeProvider>
      </ChannelListProvider>
    )
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

  const sidebarRef = useRef<any>(null)
  const { handleSidebarResize, handleSidebarPointerUp } = useSidebarResizeLogic(sidebarRef)
  const { mode } = useSidebarMode()

  const [panelSize, setPanelSize] = useState(30); // defaultSize


  return (
    <UserListProvider>
      <CircleUserListProvider>
        <HStack gap='0' className={`flex h-screen ${mode}`}>
          {!isMobile && <WorkspacesSidebar />}

          <PanelGroup direction='horizontal' className='flex-1'>
            {/* Sidebar trái */}
            <Panel
              ref={sidebarRef}
              defaultSize={15}
              minSize={3}
              maxSize={15}
              onResize={handleSidebarResize}
            >
              <SidebarContainer sidebarRef={sidebarRef}/>
            </Panel>

            <PanelResizeHandle
              className='cursor-col-resize bg-gray-300 dark:bg-gray-600 w-px panel-1'
              onPointerUp={handleSidebarPointerUp}
            />

            {/* Danh sách tin nhắn */}
            <Panel onResize={(size) => setPanelSize(size)} defaultSize={30} minSize={20} maxSize={55}>
              <div className='flex flex-col gap-2 w-full h-full'>
                <SidebarHeader />
                <div className='px-2'>
                  <div className='h-px bg-gray-400 dark:bg-gray-600' />
                </div>
                <SidebarBody size={panelSize} />
              </div>
            </Panel>

            <PanelResizeHandle
              className='cursor-col-resize bg-gray-300 dark:bg-gray-600 w-px handle-2'
              onPointerUp={handleSidebarPointerUp}
            />

            {/* Nội dung chính */}
            <Panel defaultSize={55} minSize={30}>
              <div className='h-full w-full dark:bg-gray-2 overflow-hidden'>
                <Outlet />
              </div>
            </Panel>
          </PanelGroup>
        </HStack>
      </CircleUserListProvider>
      <CommandMenu />
      <MessageActionController />
    </UserListProvider>
  )
}