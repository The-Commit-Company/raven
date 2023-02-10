import { FrappeProvider } from 'frappe-react-sdk'
import { Route, Routes } from 'react-router-dom'
import { TestPage } from './pages/TestPage'

function App() {

  return (
    <FrappeProvider url={import.meta.env.VITE_FRAPPE_PATH ?? ''}>
      <Routes>
        <Route path="/" element={<TestPage />} />
      </Routes>
    </ FrappeProvider>
  )
}

export default App
