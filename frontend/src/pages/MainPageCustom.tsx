// import { Flex, Box } from '@radix-ui/themes'
import { Outlet, useParams } from 'react-router-dom'
import { lazy, Suspense, useContext, useEffect, useRef, useState, useMemo } from 'react'
// import { Sidebar } from '../components/layout/Sidebar/Sidebar'
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
import { SidebarMode, SidebarModeProvider, useSidebarMode } from '@/utils/layout/sidebar'
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
  const sidebarRef = useRef<any>(null)
  const { handleSidebarResize, handleSidebarPointerUp } = useSidebarResizeLogic(sidebarRef)
  const { mode, setMode } = useSidebarMode()
  const [panelSize, setPanelSize] = useState(30)
  const [initialLayoutLoaded, setInitialLayoutLoaded] = useState(false)
  const [initialLayout, setInitialLayout] = useState<string | null>(null)

  

  useFetchActiveUsersRealtime()
  useActiveSocketConnection()

  const { mutate } = useSWRConfig()
  const onThreadReplyEvent = useUnreadThreadsCountEventListener()

  useFrappeEventListener('channel_members_updated', (payload) => {
    mutate(['channel_members', payload.channel_id])
  })

  useFrappeEventListener('thread_reply', (event) => {
    if (event.channel_id) {
      mutate(
        ['thread_reply_count', event.channel_id],
        { message: event.number_of_replies },
        { revalidate: false }
      )

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

  const localStorageWrapper = useMemo(() => ({
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
  }), [])

  if (!initialLayoutLoaded) return null

  return (
    <UserListProvider>
      <CircleUserListProvider>
        <HStack gap="0" className={`flex h-screen ${mode}`}>
          {!isMobile && <WorkspacesSidebar />}

          <PanelGroup
            direction="horizontal"
            className="flex-1"
            autoSaveId="main-layout"
            storage={localStorageWrapper}
          >
            <Panel
              ref={sidebarRef}
              minSize={3}
              maxSize={15}
              {...(!initialLayout ? { defaultSize: 15 } : {})}
              onResize={handleSidebarResize}
            >
              <SidebarContainer sidebarRef={sidebarRef} />
            </Panel>

            <PanelResizeHandle
              className="cursor-col-resize bg-gray-300 dark:bg-gray-600 w-px panel-1"
              onPointerUp={handleSidebarPointerUp}
            />

            <Panel
              onResize={(size) => setPanelSize(size)}
              minSize={20}
              maxSize={55}
              {...(!initialLayout ? { defaultSize: 30 } : {})}
            >
              <div className="flex flex-col gap-2 w-full h-full">
                <SidebarHeader />
                <div className="px-2">
                  <div className="h-px bg-gray-400 dark:bg-gray-600" />
                </div>
                <SidebarBody size={panelSize} />
              </div>
            </Panel>

            <PanelResizeHandle
              className="cursor-col-resize bg-gray-300 dark:bg-gray-600 w-px handle-2"
              onPointerUp={handleSidebarPointerUp}
            />

            <Panel minSize={30} {...(!initialLayout ? { defaultSize: 55 } : {})}>
              <div className="h-full w-full dark:bg-gray-2 overflow-hidden">
                <Outlet />
              </div>
            </Panel>
          </PanelGroup>
        </HStack>
        <CommandMenu />
        <MessageActionController />
      </CircleUserListProvider>
    </UserListProvider>
  )
}
