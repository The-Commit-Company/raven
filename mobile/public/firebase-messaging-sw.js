importScripts(
  'https://www.gstatic.com/firebasejs/9.7.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.7.0/firebase-messaging-compat.js'
);
// import { precacheAndRoute } from 'workbox-precaching';
// import { clientsClaim } from 'workbox-core'
// // self.__WB_MANIFEST is default injection point
// precacheAndRoute(self.__WB_MANIFEST);

// self.skipWaiting()
// clientsClaim()

const jsonConfig = new URL(location).searchParams.get('config');
console.log('install jsonConfig', new URL(location).searchParams.get('config'));

firebase.initializeApp(JSON.parse(jsonConfig));

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    // icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', (event) => {
  console.log('Installed');
});
// {
//     apiKey: "AIzaSyA9ItYZ5fQsLEdsfRD9RUAbYrfssLLQGbI",
//     authDomain: "raven-dev-frappe.firebaseapp.com",
//     projectId: "raven-dev-frappe",
//     storageBucket: "raven-dev-frappe.appspot.com",
//     messagingSenderId: "856329963312",
//     appId: "1:856329963312:web:882dcbf15ac67ca5e52af5"
// });
