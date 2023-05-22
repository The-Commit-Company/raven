import { FrappeProvider } from 'frappe-react-sdk'
import { Route, Routes } from 'react-router-dom'
import { Login } from './pages/auth'
import { ChatSpace } from './pages/ChatSpace'
import { MainPage } from './pages/MainPage'
import { ProtectedRoute } from './utils/auth/ProtectedRoute'
import { UserProvider } from './utils/auth/UserProvider'
import { ChannelRedirect } from './utils/channel/ChannelRedirect'
import { registerObserver } from 'react-perf-devtool'

function App() {

  registerObserver()

  return (
    <FrappeProvider url={import.meta.env.VITE_FRAPPE_PATH ?? ''}>
      <UserProvider>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<ChannelRedirect />} />
            <Route path="channel" element={<MainPage />} >
              <Route path=":channelID" element={<ChatSpace />} />
            </Route>
          </Route>
        </Routes>
      </UserProvider>
    </ FrappeProvider>
  )
}

export default App
