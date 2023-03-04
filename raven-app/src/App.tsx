import { FrappeProvider } from 'frappe-react-sdk'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Login } from './pages/auth'
import { ChatSpace } from './pages/ChatSpace'
import { MainPage } from './pages/MainPage'
import { ProtectedRoute } from './utils/auth/ProtectedRoute'
import { UserProvider } from './utils/auth/UserProvider'

function App() {

  return (
    <FrappeProvider url={import.meta.env.VITE_FRAPPE_PATH ?? ''}>
      <UserProvider>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="channel/general" replace />} />
            <Route path="channel" element={<MainPage />} >
              <Route path=":channelID" element={<ChatSpace />} />
              <Route path="*" element={<Navigate to="general" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="channel/general" replace />} />
            <Route path="" element={<Navigate to="channel/general" replace />} />
          </Route>
        </Routes>
      </UserProvider>
    </ FrappeProvider>
  )
}

export default App
