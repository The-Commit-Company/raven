import { FrappeProvider } from 'frappe-react-sdk'
import { Route, Routes } from 'react-router-dom'
import { TestPage } from './pages/TestPage'
import { UserProvider } from './utils/auth/UserProvider'
import { ChannelProvider } from './utils/channel/ChannelContext'

function App() {

  return (
    <FrappeProvider url={import.meta.env.VITE_FRAPPE_PATH ?? ''}>
      <UserProvider>
        <Routes>
          <Route path='channel/:channelID' element={<ChannelProvider />}>
            <Route path="test" element={<TestPage />} />
          </Route>
        </Routes>
      </UserProvider>
    </ FrappeProvider>
  )
}

export default App
