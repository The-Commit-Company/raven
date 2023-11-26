import { ChakraProvider } from '@chakra-ui/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '@radix-ui/themes/styles.css';
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* <BrowserRouter basename={import.meta.env.VITE_BASE_NAME ?? ''}> */}
    <ChakraProvider>
      {/* <Theme
          radius='medium'
          appearance='dark'
          panelBackground='translucent'> */}
      <App />
      {/* </Theme> */}
    </ChakraProvider>
    {/* </BrowserRouter> */}
  </React.StrictMode>
)
