import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import './index.css'
if (import.meta.env.DEV) {
  fetch('/api/method/raven.www.raven.get_context_for_dev', {
    method: 'POST',
  })
    .then(response => response.json())
    .then((values) => {
      const v = JSON.parse(values.message)
      // @ts-ignore
      if (!window.frappe) window.frappe = {};
      //@ts-ignore
      frappe.boot = v
      //@ts-ignore
      frappe._messages = frappe.boot["__messages"];

    })
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.VITE_BASE_NAME ?? ''}>
      <ChakraProvider>
        <Theme
          radius='medium'
          appearance='dark'
          panelBackground='translucent'>
          <App />
        </Theme>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
)
