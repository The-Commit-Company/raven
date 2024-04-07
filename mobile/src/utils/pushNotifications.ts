export const isChrome = () =>
    navigator.userAgent.toLowerCase().includes("chrome")

export const showNotification = (payload: any) => {
    // @ts-ignore
    const registration = window.frappePushNotification.serviceWorkerRegistration
    if (!registration) return

    const currentUser = localStorage.getItem("currentUser")

    if (currentUser === "Guest") return

    if (currentUser === payload?.data?.from_user) return

    const notificationTitle = payload?.data?.title
    const notificationOptions = {
        body: payload?.data?.body || "",
    }
    if (payload?.data?.notification_icon) {
        // @ts-ignore
        notificationOptions["icon"] = payload.data.notification_icon
    }

    if (payload.data.raven_message_type === "Image") {
        // @ts-ignore
        notificationOptions["image"] = payload.data.content
    }

    if (payload.data.creation) {
        // @ts-ignore
        notificationOptions["timestamp"] = payload.data.creation
    }

    if (payload.data.channel_id) {
        // @ts-ignore
        notificationOptions["tag"] = payload.data.channel_id
    }
    const url = `${payload.data.base_url}/raven_mobile/channel/${payload.data.channel_id}`
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

export const clearNotifications = (channelID: string) => {

    // @ts-ignore
    const registration = window.frappePushNotification.serviceWorkerRegistration
    if (!registration) return

    registration.getNotifications({ tag: channelID }).then((notifications: Notification[]) => {
        notifications.forEach((notification) => {
            notification.close()
        })
    })
}