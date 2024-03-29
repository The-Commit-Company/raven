export const isChrome = () =>
    navigator.userAgent.toLowerCase().includes("chrome")

export const showNotification = (payload: any) => {
    // @ts-ignore
    const registration = window.frappePushNotification.serviceWorkerRegistration
    if (!registration) return

    const notificationTitle = payload?.data?.title
    const notificationOptions = {
        body: payload?.data?.body || "",
    }
    if (payload?.data?.notification_icon) {
        // @ts-ignore
        notificationOptions["icon"] = payload.data.notification_icon
    }
    if (isChrome()) {
        // @ts-ignore
        notificationOptions["data"] = {
            url: payload?.data?.click_action,
        }
    } else {
        if (payload?.data?.click_action) {
            // @ts-ignore
            notificationOptions["actions"] = [
                {
                    action: payload.data.click_action,
                    title: "View Details",
                },
            ]
        }
    }

    registration.showNotification(notificationTitle, notificationOptions)
}