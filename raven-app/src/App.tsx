import { FrappeProvider } from 'frappe-react-sdk'
import { Route, Routes } from 'react-router-dom'
import { TestPage } from './pages/TestPage'
import { UserProvider } from './utils/auth/UserProvider'

function App() {

  return (
    <FrappeProvider url={import.meta.env.VITE_FRAPPE_PATH ?? ''}>
      <UserProvider>
        <Routes>
          <Route path="/" element={<TestPage />} />
        </Routes>
      </UserProvider>
    </ FrappeProvider>
  )
}

export default App
