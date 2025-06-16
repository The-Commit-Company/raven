import { Navigate, Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import WorkspaceSwitcherGrid from './components/layout/WorkspaceSwitcherGrid'
import ErrorPage from './pages/ErrorPage'
import { MainPageCustom } from './pages/MainPageCustom'
import MobileTabsPage from './pages/MobileTabsPage'
import WorkspaceSwitcher from './pages/WorkspaceSwitcher'
import { ProtectedRoute } from './utils/auth/ProtectedRoute'

const isDesktop = window.innerWidth > 768
const lastWorkspace = localStorage.getItem('ravenLastWorkspace') ?? ''
const lastChannel = localStorage.getItem('ravenLastChannel') ?? ''

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<ProtectedRoute requireAuth={false} />}>
        <Route path='/login' lazy={() => import('@/pages/auth/Login')} />
        <Route path='/login-with-email' lazy={() => import('@/pages/auth/LoginWithEmail')} />
        <Route path='/signup' lazy={() => import('@/pages/auth/SignUp')} />
        <Route path='/forgot-password' lazy={() => import('@/pages/auth/ForgotPassword')} />
      </Route>
      <Route path='/' element={<ProtectedRoute requireAuth={true} />} errorElement={<ErrorPage />}>
        <Route path='/' element={<WorkspaceSwitcher />}>
          <Route
            index
            element={
              lastWorkspace && lastChannel && isDesktop ? (
                <Navigate to={`/${lastWorkspace}/${lastChannel}`} replace />
              ) : lastWorkspace ? (
                <Navigate to={`/${lastWorkspace}`} replace />
              ) : (
                <WorkspaceSwitcherGrid />
              )
            }
          />
          <Route path='workspace-explorer' element={<WorkspaceSwitcherGrid />} />
          <Route path='settings' lazy={() => import('./pages/settings/Settings')}>
            <Route index lazy={() => import('./components/feature/userSettings/UserProfile/UserProfile')} />
            <Route path='profile' lazy={() => import('./components/feature/userSettings/UserProfile/UserProfile')} />
            <Route path='users' lazy={() => import('./pages/settings/Users/UserList')} />
            <Route path='appearance' lazy={() => import('./pages/settings/Appearance')} />
            <Route path='preferences' lazy={() => import('./pages/settings/Preferences')} />
            <Route path='hr' lazy={() => import('./pages/settings/Integrations/FrappeHR')} />
            <Route path='document-previews' lazy={() => import('./pages/settings/Integrations/DocumentPreviewTool')} />
            <Route path='workspaces'>
              <Route index lazy={() => import('./pages/settings/Workspaces/WorkspaceList')} />
              <Route path=':ID' lazy={() => import('./pages/settings/Workspaces/ViewWorkspace')} />
            </Route>
            <Route path='emojis' lazy={() => import('./pages/settings/CustomEmojis/CustomEmojiList')} />
            <Route path='bots'>
              <Route index lazy={() => import('./pages/settings/AI/BotList')} />
              <Route path='create' lazy={() => import('./pages/settings/AI/CreateBot')} />
              <Route path=':ID' lazy={() => import('./pages/settings/AI/ViewBot')} />
            </Route>
            <Route path='functions'>
              <Route index lazy={() => import('./pages/settings/AI/FunctionList')} />
              <Route path='create' lazy={() => import('./pages/settings/AI/CreateFunction')} />
              <Route path=':ID' lazy={() => import('./pages/settings/AI/ViewFunction')} />
            </Route>
            <Route path='document-notifications'>
              <Route index lazy={() => import('./pages/settings/DocumentNotifications/DocumentNotificationList')} />
              <Route
                path='create'
                lazy={() => import('./pages/settings/DocumentNotifications/CreateDocumentNotification')}
              />
              <Route
                path=':ID'
                lazy={() => import('./pages/settings/DocumentNotifications/ViewDocumentNotification')}
              />
            </Route>
            <Route path='instructions'>
              <Route index lazy={() => import('./pages/settings/AI/InstructionTemplateList')} />
              <Route path='create' lazy={() => import('./pages/settings/AI/CreateInstructionTemplate')} />
              <Route path=':ID' lazy={() => import('./pages/settings/AI/ViewInstructionTemplate')} />
            </Route>
            <Route path='commands'>
              <Route index lazy={() => import('./pages/settings/AI/SavedPromptsList')} />
              <Route path='create' lazy={() => import('./pages/settings/AI/CreateSavedPrompt')} />
              <Route path=':ID' lazy={() => import('./pages/settings/AI/ViewSavedPrompt')} />
            </Route>
            <Route path='openai-settings' lazy={() => import('./pages/settings/AI/OpenAISettings')} />
            <Route path='webhooks'>
              <Route index lazy={() => import('./pages/settings/Webhooks/WebhookList')} />
              <Route path='create' lazy={() => import('./pages/settings/Webhooks/CreateWebhook')} />
              <Route path=':ID' lazy={() => import('./pages/settings/Webhooks/ViewWebhook')} />
            </Route>
            <Route path='scheduled-messages'>
              <Route index lazy={() => import('./pages/settings/ServerScripts/SchedulerEvents/SchedulerEvents')} />
              <Route
                path='create'
                lazy={() => import('./pages/settings/ServerScripts/SchedulerEvents/CreateSchedulerEvent')}
              />
              <Route
                path=':ID'
                lazy={() => import('./pages/settings/ServerScripts/SchedulerEvents/ViewSchedulerEvent')}
              />
            </Route>
            <Route path='message-actions'>
              <Route index lazy={() => import('./pages/settings/MessageActions/MessageActionList')} />
              <Route path='create' lazy={() => import('./pages/settings/MessageActions/CreateMessageAction')} />
              <Route path=':ID' lazy={() => import('./pages/settings/MessageActions/ViewMessageAction')} />
            </Route>
            <Route path='mobile-app' lazy={() => import('./pages/settings/MobileApp')} />
            <Route path='push-notifications' lazy={() => import('./pages/settings/PushNotifications')} />
            <Route path='help' lazy={() => import('./pages/settings/HelpAndSupport')} />
          </Route>
          <Route path=':workspaceID' element={<MainPageCustom />}>
            <Route index element={<MobileTabsPage />} />
            <Route path='threads' lazy={() => import('./components/feature/threads/Threads')}>
              <Route path=':threadID' lazy={() => import('./components/feature/threads/ThreadManager/ViewThread')} />
            </Route>
            <Route path=':channelID' lazy={() => import('@/pages/ChatSpace')}>
              <Route
                path='thread/:threadID'
                lazy={() => import('./components/feature/threads/ThreadDrawer/ThreadDrawer')}
              />
            </Route>
            <Route path='chatbot/:botID' lazy={() => import('@/pages/ChatBotPage')} />
          </Route>
        </Route>
      </Route>
      <Route path='*' lazy={() => import('./pages/NotFound')} />
    </>
  ),
  {
    basename: import.meta.env.VITE_BASE_NAME ? `/${import.meta.env.VITE_BASE_NAME}` : ''
  }
)

export default router
