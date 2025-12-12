import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppSettings from "./pages/AppSettings"
import Channel from "@pages/Channel"
import Mentions from "@pages/Mentions"
import SavedMessages from "@pages/SavedMessages"
import Search from "@pages/Search"
import ChannelSettings from "@components/features/channel/ChannelSettings/ChannelSettings"
import MainPage from "@pages/MainPage"
import { FrappeProvider } from 'frappe-react-sdk'
import { init } from 'emoji-mart'
import Cookies from 'js-cookie'
import LoginPage from "@pages/auth/Login"
import ForgotPassword from "@pages/auth/ForgotPassword"

const isDesktop = window.innerWidth > 768

let lastWorkspace = ""
let lastChannel = ""

try {
  lastWorkspace = JSON.parse(localStorage.getItem('ravenLastWorkspace') ?? '""') ?? ''
  lastChannel = JSON.parse(localStorage.getItem('ravenLastChannel') ?? '""') ?? ''
}
catch {

}


function App() {

  return (
    <FrappeProvider
      url={import.meta.env.VITE_FRAPPE_PATH ?? ''}
      socketPort={import.meta.env.VITE_SOCKET_PORT ? import.meta.env.VITE_SOCKET_PORT : undefined}
      swrConfig={{
        errorRetryCount: 2,
        // @ts-ignore - SWR config
        provider: localStorageProvider
      }}
      siteName={getSiteName()}
    >
      <BrowserRouter basename={import.meta.env.VITE_BASE_NAME}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<MainPage />}>
            <Route index element={<Channel />} />
            <Route path="channel/:id" element={<Channel />} />
            <Route path="channel/:id/settings" element={<ChannelSettings />} />
            <Route path="mentions" element={<Mentions />} />
            <Route path="settings" element={<AppSettings />} />
            <Route path="saved-messages" element={<SavedMessages />} />
            <Route path="search" element={<Search />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FrappeProvider>
  )
}

/** ----- SWR Caching ----- */

const CACHE_KEYS = [
  "raven.api.login.get_context",
  "workspaces_list",
  "channel_list",
]

function localStorageProvider() {
  // When initializing, we restore the data from `localStorage` into a map.
  // Check if local storage is recent (less than a week). Else start with a fresh cache.
  const timestamp = localStorage.getItem('app-cache-timestamp')
  let cache = '[]'
  if (timestamp && Date.now() - parseInt(timestamp) < 7 * 24 * 60 * 60 * 1000) {
    const localCache = localStorage.getItem('app-cache')
    if (localCache) {
      cache = localCache
    }
  }
  const map = new Map<string, string | number>(JSON.parse(cache))

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener('beforeunload', () => {

    // Check if the user is logged in
    const user_id = Cookies.get('user_id')
    if (!user_id || user_id === 'Guest') {
      localStorage.removeItem('app-cache')
      localStorage.removeItem('app-cache-timestamp')
    } else {
      const entries = map.entries()

      const cacheEntries = []

      for (const [key, value] of entries) {

        let hasCacheKey = false
        for (const cacheKey of CACHE_KEYS) {
          if (key.includes(cacheKey)) {
            hasCacheKey = true
            break
          }
        }

        // Cache only the keys that are in CACHE_KEYS
        if (hasCacheKey) {
          cacheEntries.push([key, value])
        }
      }
      const appCache = JSON.stringify(cacheEntries)
      localStorage.setItem('app-cache', appCache)
      localStorage.setItem('app-cache-timestamp', Date.now().toString())
    }
  })

  // We still use the map for write & read for performance.
  return map
}

// Initialize emoji-mart
init({
  data: async () => {
    const response = await fetch(
      'https://cdn.jsdelivr.net/npm/@emoji-mart/data/sets/14/apple.json',
    )

    return response.json()
  },
  set: 'apple',
})

const getSiteName = () => {
  // @ts-expect-error - Window exists
  if (window.frappe?.boot?.versions?.frappe.startsWith('14')) {
    return import.meta.env.VITE_SITE_NAME
  }
  else {
    // @ts-expect-error - Window exists
    return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME
  }
}


export default App
