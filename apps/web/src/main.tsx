import { scan } from "react-scan";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

scan({
  enabled: true,
});


// @ts-expect-error - frappePushNotification is not defined
import FrappePushNotification from "../public/frappe-push-notification";


const registerServiceWorker = () => {
  // @ts-expect-error - frappePushNotification is not defined
  window.frappePushNotification = new FrappePushNotification("raven")

  if ("serviceWorker" in navigator) {
    // @ts-expect-error - frappePushNotification is not defined
    window.frappePushNotification
      .appendConfigToServiceWorkerURL("/assets/raven/raven/sw.js")
      .then((url: string) => {
        navigator.serviceWorker
          .register(url, {
            type: "classic",
          })
          .then((registration) => {
            // @ts-expect-error - frappePushNotification is not defined
            window.frappePushNotification.initialize(registration).then(() => {
              console.info("Frappe Push Notification initialized")
            })
          })
      })
      .catch((err: Error) => {
        console.error("Failed to register service worker", err)
      })
  } else {
    console.error("Service worker not enabled/supported by browser")
  }
}

if (import.meta.env.DEV) {
  fetch('/api/method/raven.www.raven.get_context_for_dev', {
    method: 'POST',
  })
    .then(response => response.json())
    .then((values) => {
      const v = JSON.parse(values.message)
      //@ts-expect-error - frappe is not defined
      if (!window.frappe) window.frappe = {};
      //@ts-expect-error - frappe.boot is not defined
      window.frappe.boot = v
      registerServiceWorker()
      createRoot(document.getElementById('root')!).render(
        <StrictMode>
          <App />
        </StrictMode>,
      )
    }
    )
} else {
  registerServiceWorker()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
