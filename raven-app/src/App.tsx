import { FrappeProvider } from 'frappe-react-sdk'
import { Route, Routes } from 'react-router-dom'
import { SavedMessages } from './components/feature/saved-messages/SavedMessages'
import { Login } from './pages/auth'
import { ChatSpace } from './pages/ChatSpace'
import { MainPage } from './pages/MainPage'
import { ProtectedRoute } from './utils/auth/ProtectedRoute'
import { UserProvider } from './utils/auth/UserProvider'
import { ChannelRedirect } from './utils/channel/ChannelRedirect'

function App() {
  return (
    <FrappeProvider
      url={import.meta.env.VITE_FRAPPE_PATH ?? ''}
      socketPort={import.meta.env.VITE_SOCKET_PORT ? import.meta.env.VITE_SOCKET_PORT : undefined}
      //@ts-ignore
      siteName={window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME}
    >
      <UserProvider>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<ChannelRedirect />} />
            <Route path="channel" element={<MainPage />} >
              <Route index element={<ChannelRedirect />} />
              <Route path="saved-messages" element={<SavedMessages />} />
              <Route path=":channelID" element={<ChatSpace />} />
            </Route>
          </Route>
        </Routes>
      </UserProvider>
    </ FrappeProvider>
  )
}

export default App