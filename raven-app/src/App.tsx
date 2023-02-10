import { FrappeProvider } from 'frappe-react-sdk'

function App() {

  return (
    <FrappeProvider url={import.meta.env.VITE_FRAPPE_PATH ?? ''}>
      <div>Hello</div>
    </ FrappeProvider>
  )
}

export default App
