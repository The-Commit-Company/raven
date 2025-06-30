export const isChrome = () =>
    navigator.userAgent.toLowerCase().includes("chrome")

export const showNotification = (payload: any) => {
    // @ts-ignore
    const registration = window.frappePushNotification.serviceWorkerRegistration
    if (!registration) return

    const notificationTitle = payload?.notification?.title
    const notificationOptions = {
        body: payload?.notification?.body || "",
    }
    if (payload?.data?.image) {
        // @ts-ignore
        notificationOptions["icon"] = payload.data.image
    }

    if (payload.data.creation) {
        // @ts-ignore
        notificationOptions["timestamp"] = payload.data.creation
    }
    let url = `${payload.data.base_url}/raven/channel/${payload.data.channel_id}`

    if (payload.data.message_url) {
        url = payload.data.message_url
    }

    if (isChrome()) {
        // @ts-ignore
        notificationOptions["data"] = {
            url: url,
        }
    } else {
        if (payload?.data?.click_action) {
            // @ts-ignore
            notificationOptions["actions"] = [
                {
                    action: url,
                    title: "View",
                },
            ]
        }
    }

    registration.showNotification(notificationTitle, notificationOptions)
}