import { IonItem, IonLabel, IonSpinner, IonToggle, useIonToast } from '@ionic/react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useState } from 'react'

const PushNotificationSetting = () => {

    const { data } = useFrappeGetCall<{ message: boolean }>('raven.api.notification.are_push_notifications_enabled', undefined, undefined, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    const [loading, setLoading] = useState(false)

    const [present] = useIonToast()

    // @ts-expect-error
    const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(window.frappePushNotification?.isNotificationEnabled())

    const togglePushNotifications = async (newValue: boolean) => {
        if (newValue) {
            enablePushNotifications()
        } else {
            setLoading(true)
            // @ts-expect-error
            window.frappePushNotification
                .disableNotification()
                .then((data: any) => {
                    setPushNotificationsEnabled(false) // Disable the switch
                    present({
                        message: "Push notifications disabled",
                        icon: "check-circle",
                        position: "bottom",
                        duration: 2000,
                        color: "success",
                    })
                })
                .catch((error: any) => {
                    present({
                        duration: 2000,
                        message: "Error: " + error.message,
                        icon: "alert-circle",
                        position: "bottom",
                        color: "danger",
                    })
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }

    const enablePushNotifications = async () => {
        setLoading(true)
        // @ts-expect-error
        window.frappePushNotification
            .enableNotification()
            .then((data: any) => {
                if (data.permission_granted) {
                    setPushNotificationsEnabled(true)
                } else {
                    present({
                        message: "Push Notification permission denied",
                        color: "danger",
                        position: "bottom",
                        icon: "alert-circle",
                        duration: 2000,
                    })
                    setPushNotificationsEnabled(false)
                }
            })
            .catch((error: any) => {
                present({
                    message: "Error: " + error.message,
                    color: "danger",
                    position: "bottom",
                    icon: "alert-circle",
                    duration: 2000,
                })
                setPushNotificationsEnabled(false)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    // @ts-expect-error
    if (window.frappe?.boot.push_relay_server_url && data?.message) {
        return (
            <IonItem>
                {loading ?
                    <>
                        <IonLabel>Enable Push Notifications</IonLabel>
                        <IonSpinner name='crescent' slot='end' />
                    </> :
                    <IonToggle
                        checked={pushNotificationsEnabled}
                        onIonChange={(e) => togglePushNotifications(e.detail.checked)}

                    >Enable Push Notifications</IonToggle>
                }
            </IonItem>
        )
    }

    return null

}

export default PushNotificationSetting