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
import ChatbotAIContainer from '@/components/feature/chatbot-ai/ChatbotAIContainer'
import ChatbotAIChatBox from '@/components/feature/chatbot-ai/ChatbotAIChatBox'
import { ChatSession } from '@/components/feature/chatbot-ai/ChatbotAIContainer'
import { useChatbotConversations, useCreateChatbotConversation, useChatbotMessages, useSendChatbotMessage } from '@/hooks/useChatbotAPI'

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
  const { mode, setMode, title } = useSidebarMode()
  const [panelSize, setPanelSize] = useState(30)
  const [initialLayoutLoaded, setInitialLayoutLoaded] = useState(false)
  const [initialLayout, setInitialLayout] = useState<string | null>(null)
  const [selectedAISessionId, setSelectedAISessionId] = useState<string | null>(null)

  // Lấy danh sách conversation từ backend
  const { data: conversations, mutate: mutateConversations } = useChatbotConversations()
  const { call: createConversation } = useCreateChatbotConversation()

  // Lấy messages từ backend
  const { data: messages, mutate: mutateMessages, isLoading: loadingMessages } = useChatbotMessages(selectedAISessionId || undefined)
  const { call: sendMessage, loading: sending } = useSendChatbotMessage()

  // Chuyển đổi dữ liệu conversation sang ChatSession cho UI
  const sessions: ChatSession[] = (Array.isArray(conversations) ? conversations : Array.isArray((conversations as any)?.message) ? (conversations as any).message : []).map((c: any) => ({
    id: c.name,
    title: c.title,
    creation: c.creation,
    messages: []
  }))

  // Hàm tạo session mới
  const handleNewSession = async () => {
    const title = `Đoạn chat mới ${sessions.length + 1}`
    const res = await createConversation({ title })
    await mutateConversations()
    setSelectedAISessionId(res.message.name)
  }

  // Hàm update tiêu đề session
  const handleUpdateAISessions = (updatedSessions: ChatSession[]) => {
    // Cập nhật state local
    const newConversations = updatedSessions.map(s => ({
      name: s.id,
      title: s.title,
      creation: s.creation
    }))
    mutateConversations(newConversations, false)
  }

  // Hàm gửi tin nhắn Chatbot AI
  const handleSendMessage = async (content: string) => {
    if (!selectedAISessionId) return
    await sendMessage({ conversation_id: selectedAISessionId, message: content })
    await mutateMessages()
  }

  // Lấy session đang chọn từ backend
  const selectedSession = sessions.find(s => s.id === selectedAISessionId)

  // Nếu selectedAISessionId không còn trong danh sách backend, tự động bỏ chọn hoặc chọn session đầu tiên
  useEffect(() => {
    if (selectedAISessionId && !sessions.find(s => s.id === selectedAISessionId)) {
      setSelectedAISessionId(sessions.length > 0 ? sessions[0].id : null)
    }
  }, [sessions, selectedAISessionId])

  useFetchActiveUsersRealtime()
  useActiveSocketConnection()

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

  // Lắng nghe realtime event new_message cho Chatbot AI
  useFrappeEventListener('new_message', (data) => {
    if (data.channel_id === selectedAISessionId) {
      mutateMessages()
    }
  })

  // Lắng nghe realtime event update_conversation_title
  useFrappeEventListener('raven:update_conversation_title', (data) => {
    if (data.conversation_id) {
      // Cập nhật conversations trong cache
      mutateConversations((oldData: any[] | undefined) => {
        const oldConversations = oldData || []
        return oldConversations.map((c: any) =>
          c.name === data.conversation_id
            ? { ...c, title: data.new_title, creation: data.creation }
            : c
        )
      }, false) // false để không revalidate với server
    }
  })

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
                <SidebarBody size={panelSize} />
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
                  <SidebarBody size={panelSize} />
                </div>
              </Panel>

              {/* Resize Handle */}
              <PanelResizeHandle
                className='cursor-col-resize bg-gray-300 dark:bg-gray-600 w-px panel-1'
                onPointerUp={handleSidebarPointerUp}
              />

              {/* Main Content Panel */}
              <Panel minSize={55} maxSize={55} {...(!initialLayout ? { defaultSize: 55 } : {})}>
                <div className='h-full w-full dark:bg-gray-2 overflow-hidden'>
                  {title === 'Chatbot AI' ? (
                    <ChatbotAIContainer
                      sessions={sessions}
                      selectedId={selectedAISessionId}
                      onSelectSession={setSelectedAISessionId}
                      onUpdateSessions={handleUpdateAISessions}
                      onNewSession={handleNewSession}
                      mutateConversations={mutateConversations}
                    />
                  ) : (
                    <Outlet />
                  )}
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
                className='cursor-col-resize bg-gray-300 dark:bg-gray-600 w-px panel-1'
                onPointerUp={handleSidebarPointerUp}
              />

              {/* Middle Panel */}
              <Panel
                onResize={(size) => setPanelSize(size)}
                minSize={isSmallScreen ? 20 : 20}
                maxSize={isSmallScreen ? 40 : 60}
                {...(!initialLayout ? { defaultSize: isSmallScreen ? 30 : 40 } : {})}
              >
                {title === 'Chatbot AI' ? (
                  <div className='h-full w-full bg-gray-1 dark:bg-[#18191b]'>
                    <ChatbotAIContainer
                      sessions={sessions}
                      selectedId={selectedAISessionId}
                      onSelectSession={setSelectedAISessionId}
                      onUpdateSessions={handleUpdateAISessions}
                      onNewSession={handleNewSession}
                      mutateConversations={mutateConversations}
                    />
                  </div>
                ) : (
                  <div className='flex flex-col gap-1 w-full h-full bg-gray-1 dark:bg-[#18191b]'>
                    <SidebarHeader />
                    <div className='px-2'>
                      <div className='h-px bg-gray-400 dark:bg-gray-600' />
                    </div>
                    <SidebarBody size={panelSize} />
                  </div>
                )}
              </Panel>

              <PanelResizeHandle
                className='cursor-col-resize bg-gray-300 dark:bg-gray-600 w-px handle-2'
                onPointerUp={handleSidebarPointerUp}
              />

              <Panel
                minSize={isSmallScreen ? 20 : 30}
                maxSize={isSmallScreen ? 80 : 90}
                {...(!initialLayout ? { defaultSize: isSmallScreen ? 70 : 60 } : {})}
              >
                <div className='h-full w-full bg-gray-1 dark:bg-gray-2 overflow-hidden'>
                  {title === 'Chatbot AI' && selectedAISessionId && selectedSession ? (
                    <ChatbotAIChatBox
                      session={{
                        id: selectedAISessionId,
                        title: selectedSession.title,
                        messages: (Array.isArray(messages)
                          ? messages
                          : Array.isArray((messages as any)?.message)
                            ? (messages as any).message
                            : []
                        ).map((m: any) => ({
                          role: m.is_user ? 'user' as const : 'ai' as const,
                          content: m.message as string
                        }))
                      }}
                      onSendMessage={handleSendMessage}
                      loading={sending || loadingMessages}
                    />
                  ) : title === 'Chatbot AI' ? (
                    <div className='flex items-center justify-center h-full text-gray-6'>Chọn đoạn chat để bắt đầu</div>
                  ) : (
                    <Outlet />
                  )}
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
