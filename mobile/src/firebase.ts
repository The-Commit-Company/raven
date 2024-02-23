// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { getMessaging, getToken, GetTokenOptions, Messaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

//     {
//     apiKey: "AIzaSyA9ItYZ5fQsLEdsfRD9RUAbYrfssLLQGbI",
//     authDomain: "raven-dev-frappe.firebaseapp.com",
//     projectId: "raven-dev-frappe",
//     storageBucket: "raven-dev-frappe.appspot.com",
//     messagingSenderId: "856329963312",
//     appId: "1:856329963312:web:882dcbf15ac67ca5e52af5"
// };

// Initialize Firebase
let app: FirebaseApp | null = null
let messaging: Messaging | null = null
export const init = () => {

    //@ts-expect-error
    if (window.frappe?.boot.raven_push_notifications?.firebase_client_configuration) {
        // @ts-expect-error
        const firebaseConfig = JSON.parse(window.frappe?.boot.raven_push_notifications?.firebase_client_configuration)
        app = initializeApp(firebaseConfig);
        messaging = getMessaging(app);
        const configJSON = encodeURIComponent(JSON.stringify(firebaseConfig))

        const url = `/assets/raven/raven_mobile/firebase-messaging-sw.js?config=${configJSON}`
        navigator.serviceWorker.register(url, {
            scope: '/assets/raven/raven_mobile/',
            type: 'classic'
        })
    }

}



export const fetchToken = async (): Promise<string | undefined> => {

    //@ts-expect-error
    if (window.frappe?.boot.raven_push_notifications
        //@ts-expect-error
        && window.frappe?.boot.raven_push_notifications?.enabled
        //@ts-expect-error
        && window.frappe?.boot.raven_push_notifications?.method === "Self-managed FCM"
        && messaging) {
        const options: GetTokenOptions = {
            //@ts-expect-error
            vapidKey: window.frappe?.boot.raven_push_notifications?.vapid_public_key
        }
        // @ts-expect-error
        const firebaseConfig = JSON.parse(window.frappe?.boot.raven_push_notifications?.firebase_client_configuration ?? '{}')
        const configJSON = encodeURIComponent(JSON.stringify(firebaseConfig))

        const url = `/assets/raven/raven_mobile/firebase-messaging-sw.js?config=${configJSON}`
        options.serviceWorkerRegistration = await navigator.serviceWorker.register(url, {
            scope: '/assets/raven/raven_mobile/',
            type: 'classic'
        })

        // console.log('options:', options)

        return getToken(messaging, options).then((currentToken) => {
            if (currentToken) {
                console.log('Token:', currentToken);
                return currentToken
            } else {
                console.log('No registration token available. Request permission to generate one.');
                requestPermission();
            }
        })
    }

}
// getToken(messaging, { vapidKey: 'BG_Q8fItODexgL5ZLh-WgQYGD0c-HCvo-S7shjiRKNFiFabO9FJNSADVU-G_vuftlETyjll6u_KIQmi7CtaugBI' }).then((currentToken) => {
//     if (currentToken) {
//         console.log('Token:', currentToken);
//     } else {
//         console.log('No registration token available. Request permission to generate one.');
//         requestPermission();
//     }
// })

function requestPermission() {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            // TODO(developer): Retrieve a registration token for use with FCM.
            // ...
        } else {
            console.log('Unable to get permission to notify.');
        }
    });
}

// onMessage(messaging, (payload) => {
//     console.log('Message received. ', payload);
//     // ...
// });