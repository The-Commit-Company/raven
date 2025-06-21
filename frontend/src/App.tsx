import 'cal-sans'
import { init } from 'emoji-mart'
import { FrappeProvider } from 'frappe-react-sdk'
import Cookies from 'js-cookie'
import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useStickyState } from './hooks/useStickyState'
import router from './router'
import { ThemeProvider } from './ThemeProvider'
import AppUpdateProvider from './utils/AppUpdateProvider'
import { UserProvider } from './utils/auth/UserProvider'

/** Following keys will not be cached in app cache */
// const NO_CACHE_KEYS = [
//   "frappe.desk.form.load.getdoctype",
//   "frappe.desk.search.search_link",
//   "frappe.model.workflow.get_transitions",
//   "frappe.desk.reportview.get_count",
//   "frappe.core.doctype.server_script.server_script.enabled",
//   "raven.api.message_actions.get_action_defaults",
//   "raven.api.document_link.get_preview_data"
// ]

const CACHE_KEYS = ['raven.api.login.get_context', 'workspaces_list', 'raven.api.raven_users.get_list', 'channel_list']

// Initialize emoji-mart
init({
  data: async () => {
    const response = await fetch('https://cdn.jsdelivr.net/npm/@emoji-mart/data/sets/14/apple.json')

    return response.json()
  },
  set: 'apple'
})

function App() {
  const [appearance, setAppearance] = useStickyState<'light' | 'dark' | 'inherit'>('dark', 'appearance')

  // We not need to pass sitename if the Frappe version is v14.

  const getSiteName = () => {
    // @ts-ignore
    if (window.frappe?.boot?.versions?.frappe.startsWith('14')) {
      return import.meta.env.VITE_SITE_NAME
    }
    // @ts-ignore
    else {
      // @ts-ignore
      return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME
    }
  }

  return (
    <FrappeProvider
      url={import.meta.env.VITE_FRAPPE_PATH ?? ''}
      socketPort={import.meta.env.VITE_SOCKET_PORT ? import.meta.env.VITE_SOCKET_PORT : undefined}
      //@ts-ignore
      swrConfig={{
        dedupingInterval: 60000,
        revalidateOnFocus: false,
        keepPreviousData: true,
        provider: localStorageProvider
      }}
      siteName={getSiteName()}
    >
      <UserProvider>
        <Toaster position='top-right' richColors />
        <ThemeProvider
          appearance={appearance}
          // grayColor='slate'
          accentColor='iris'
          panelBackground='translucent'
          setAppearance={setAppearance}
        >
          <Suspense fallback={<></>}>
            <RouterProvider router={router} />
          </Suspense>
          <AppUpdateProvider />
        </ThemeProvider>
      </UserProvider>
    </FrappeProvider>
  )
}

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
  const map = new Map<string, any>(JSON.parse(cache))

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

export default App
