import { Box, Flex } from '@radix-ui/themes'
import { lazy, Suspense, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
// import { Sidebar } from '../components/layout/Sidebar/Sidebar'
import CommandMenu from '@/components/feature/CommandMenu/CommandMenu'
import MessageActionController from '@/components/feature/message-actions/MessageActionController'
import { FullPageLoader } from '@/components/layout/Loaders/FullPageLoader'
import { SidebarBody } from '@/components/layout/Sidebar/SidebarBodyCustom'
import SidebarContainer from '@/components/layout/Sidebar/SidebarContainer'
import { SidebarHeader } from '@/components/layout/Sidebar/SidebarHeader'
import { useSidebarResizeLogic } from '@/components/layout/Sidebar/useSidebarResizeLogic'
import WorkspacesSidebar from '@/components/layout/Sidebar/WorkspacesSidebar'
import { HStack } from '@/components/layout/Stack'
import { useFetchActiveUsersRealtime } from '@/hooks/fetchers/useFetchActiveUsers'
import { useActiveSocketConnection } from '@/hooks/useActiveSocketConnection'
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQuery'
import { useUnreadThreadsCountEventListener } from '@/hooks/useUnreadThreadsCount'
import { UserContext } from '@/utils/auth/UserProvider'
import { SidebarMode, SidebarModeProvider, useSidebarMode } from '@/utils/layout/sidebar'
import { showNotification } from '@/utils/pushNotifications'
import { hasRavenUserRole } from '@/utils/roles'
import { CircleUserListProvider } from '@/utils/users/CircleUserListProvider'
import { UserListProvider } from '@/utils/users/UserListProvider'
import { useFrappeEventListener, useSWRConfig } from 'frappe-react-sdk'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { ChannelListProvider } from '../utils/channel/ChannelListProvider'
import { useLastMessageUpdatedListener } from '@/hooks/useLastMessageUpdatedListener'
import { useChannelDoneListener } from '@/hooks/useChannelDoneListener'

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
    return (
      <Suspense fallback={<FullPageLoader />}>
        <AddRavenUsersPage />
      </Suspense>
    )
  }
}

const MainPageContent = () => {
  const { currentUser } = useContext(UserContext)
  const { threadID } = useParams()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const sidebarRef = useRef<any>(null)
  const { handleSidebarResize, handleSidebarPointerUp } = useSidebarResizeLogic(sidebarRef)
  const { mode, setMode } = useSidebarMode()
  const [, setPanelSize] = useState(30)
  const [initialLayoutLoaded, setInitialLayoutLoaded] = useState(false)
  const [initialLayout, setInitialLayout] = useState<string | null>(null)

  useFetchActiveUsersRealtime()
  useActiveSocketConnection()
  useChannelDoneListener()

  useLastMessageUpdatedListener()

  const { mutate } = useSWRConfig()
  const onThreadReplyEvent = useUnreadThreadsCountEventListener()

  useFrappeEventListener('channel_members_updated', (payload) => {
    mutate(['channel_members', payload.channel_id])
  })

  useFrappeEventListener('thread_reply', (event) => {
    if (event.channel_id) {
      mutate(['thread_reply_count', event.channel_id], { message: event.number_of_replies }, { revalidate: true })

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

    if (event.sent_by === currentUser || threadID === event.channel_id) return
    onThreadReplyEvent(event.channel_id)
  })

  useEffect(() => {
    window?.frappePushNotification?.onMessage((payload: any) => {
      showNotification(payload)
    })
  }, [])

  // Load layout from localStorage before first render
  useEffect(() => {
    const raw = localStorage.getItem('layout')
    const parsed = raw ? JSON.parse(raw) : {}
    const layout = parsed['main-layout'] || null
    setInitialLayout(layout)
    setInitialLayoutLoaded(true)
  }, [])

  useEffect(() => {
    const savedMode = localStorage.getItem('sidebar-mode') as SidebarMode | null
    if (savedMode && savedMode !== mode) {
      setMode(savedMode)
    }
  }, [])

  const localStorageWrapper = useMemo(
    () => ({
      getItem(name: string) {
        try {
          const raw = localStorage.getItem('layout')
          const parsed = raw ? JSON.parse(raw) : {}
          return parsed[name] || ''
        } catch (error) {
          console.error('[localStorage getItem error]', error)
          return ''
        }
      },
      setItem(name: string, value: string) {
        try {
          const raw = localStorage.getItem('layout')
          const parsed = raw ? JSON.parse(raw) : {}
          parsed[name] = value
          localStorage.setItem('layout', JSON.stringify(parsed))
        } catch (error) {
          console.error('[localStorage setItem error]', error)
        }
      }
    }),
    []
  )

  if (!initialLayoutLoaded) return null

  const isSmallScreen = window.innerWidth < 1366

  return (
    <UserListProvider>
      <CircleUserListProvider>
        <HStack gap='0' className={`flex h-screen ${mode}`}>
          {/* Sidebar cố định chỉ hiện khi desktop */}
          {!isMobile && !isTablet && <WorkspacesSidebar />}

          {isMobile ? (
            // ==============================
            // 📱 MOBILE LAYOUT
            // ==============================
            <Flex className='w-full h-full'>
              <Box className='w-full h-full'>
                <SidebarHeader />
                <Box className='px-2'>
                  <Box className='h-px bg-gray-400 dark:bg-gray-600' />
                </Box>
                <SidebarBody />
              </Box>
              <Box className='w-full absolute dark:bg-gray-2'>
                <Outlet />
              </Box>
            </Flex>
          ) : isTablet ? (
            // ==============================
            // 💊 TABLET LAYOUT: 2 Panel
            // ==============================
            <PanelGroup
              direction='horizontal'
              className='flex-1'
              autoSaveId={isMobile ? undefined : isTablet ? 'main-layout-tablet' : 'main-layout-desktop'}
              storage={localStorageWrapper}
            >
              {/* Sidebar Panel */}
              <Panel
                onResize={(size) => setPanelSize(size)}
                minSize={45}
                maxSize={45}
                {...(!initialLayout ? { defaultSize: 45 } : {})}
              >
                <div className='flex flex-col gap-1 w-full h-full overflow-hidden'>
                  <SidebarHeader />
                  <div className='px-2'>
                    <div className='h-px bg-gray-400 dark:bg-gray-600' />
                  </div>
                  <SidebarBody />
                </div>
              </Panel>

              {/* Resize Handle */}
              <PanelResizeHandle
                className='cursor-col-resize bg-gray-4 dark:bg-gray-6 w-px panel-1 '
                onPointerUp={handleSidebarPointerUp}
              />

              {/* Main Content Panel */}
              <Panel minSize={55} maxSize={55} {...(!initialLayout ? { defaultSize: 55 } : {})}>
                <div className='h-full w-full dark:bg-gray-2 overflow-hidden'>
                  <Outlet />
                </div>
              </Panel>
            </PanelGroup>
          ) : (
            // ==============================
            // 🖥 DESKTOP LAYOUT: 3 Panel
            // ==============================
            <PanelGroup
              direction='horizontal'
              className='flex-1'
              autoSaveId='main-layout'
              storage={localStorageWrapper}
            >
              {/* Sidebar Panel */}
              <Panel
                ref={sidebarRef}
                minSize={3}
                maxSize={15}
                {...(!initialLayout ? { defaultSize: 15 } : {})}
                onResize={handleSidebarResize}
              >
                <SidebarContainer sidebarRef={sidebarRef} />
              </Panel>

              {/* Resize Handle 1 */}
              <PanelResizeHandle
                className='cursor-col-resize bg-gray-4 dark:bg-gray-6 w-px panel-1 '
                onPointerUp={handleSidebarPointerUp}
              />

              {/* Middle Panel */}
              <Panel
                onResize={(size) => setPanelSize(size)}
                minSize={20}
                maxSize={isSmallScreen ? 20 : 20}
                {...(!initialLayout ? { defaultSize: isSmallScreen ? 20 : 20 } : {})}
              >
                <div className='flex flex-col gap-1 w-full h-full'>
                  <SidebarHeader />
                  <div className='px-2'>
                    <div className='h-px bg-gray-4 dark:bg-gray-6' />
                  </div>
                  <SidebarBody />
                </div>
              </Panel>

              {/* Resize Handle 2 */}
              <PanelResizeHandle
                className='cursor-col-resize bg-gray-4 dark:bg-gray-6 w-px handle-2'
                onPointerUp={handleSidebarPointerUp}
              />

              {/* Main Content Panel */}
              <Panel minSize={30} maxSize={90} {...(!initialLayout ? { defaultSize: 60 } : {})}>
                <div className='h-full w-full dark:bg-gray-2 overflow-hidden'>
                  <Outlet />
                </div>
              </Panel>
            </PanelGroup>
          )}
        </HStack>

        <CommandMenu />
        <MessageActionController />
      </CircleUserListProvider>
    </UserListProvider>
  )
}
