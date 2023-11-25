import { FrappeProvider } from 'frappe-react-sdk'
import { Route, Routes } from 'react-router-dom'
import { SavedMessages } from './components/feature/saved-messages/SavedMessages'
import { Login } from './pages/auth'
import { ChatSpace } from './pages/ChatSpace'
import { MainPage } from './pages/MainPage'
import { ProtectedRoute } from './utils/auth/ProtectedRoute'
import { UserProvider } from './utils/auth/UserProvider'
import { ChannelRedirect } from './utils/channel/ChannelRedirect'
import "cal-sans";
import { useState } from 'react'
import { ThemeProvider } from './ThemeProvider'
import { Toaster } from './components/common/Toast/Toaster'

function App() {

  const [appearance, setAppearance] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    setAppearance(appearance === 'dark' ? 'light' : 'dark');
  };

  // We need to pass sitename only if the Frappe version is v15 or above.

  const getSiteName = () => {
    // @ts-ignore
    if (window.frappe?.boot?.versions?.frappe && window.frappe.boot.versions.frappe.startsWith('15')) {
      // @ts-ignore
      return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME
    }
    return import.meta.env.VITE_SITE_NAME

  }

  return (
    <FrappeProvider
      url={import.meta.env.VITE_FRAPPE_PATH ?? ''}
      socketPort={import.meta.env.VITE_SOCKET_PORT ? import.meta.env.VITE_SOCKET_PORT : undefined}
      //@ts-ignore
      siteName={getSiteName()}
    >
      <UserProvider>
        <ThemeProvider
          appearance={appearance}
          grayColor='slate'
          accentColor='iris'
          panelBackground='translucent'
          toggleTheme={toggleTheme}>
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
          <Toaster />
        </ThemeProvider>
      </UserProvider>
    </FrappeProvider>
  )
}

export default App