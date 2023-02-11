import { FrappeProvider } from 'frappe-react-sdk'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MainPage } from './pages/MainPage'
import { TestPage } from './pages/TestPage'
import { ProtectedRoute } from './utils/auth/ProtectedRoute'
import { UserProvider } from './utils/auth/UserProvider'

function App() {

  return (
    <FrappeProvider url={import.meta.env.VITE_FRAPPE_PATH ?? ''}>
      <UserProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="channel" element={<MainPage />}>
              <Route path=":channelID" element={<TestPage />} />
            </Route>
            <Route path="" element={<Navigate to="channel" replace />} />
          </Route>
        </Routes>
      </UserProvider>
    </ FrappeProvider>
  )
}

export default App
