import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import useIsPushNotificationEnabled from '@/hooks/fetchers/useIsPushNotificationEnabled'
import { DropdownMenu } from '@radix-ui/themes'
import { useState } from 'react'
import { BsBell, BsBellSlash } from 'react-icons/bs'
import { toast } from 'sonner'

type Props = {}

const PushNotificationToggle = (props: Props) => {

    const isPushAvailable = useIsPushNotificationEnabled()

    // @ts-expect-error
    const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(window.frappePushNotification?.isNotificationEnabled())

    const togglePushNotifications = async () => {
        if (!pushNotificationsEnabled) {
            enablePushNotifications()
        } else {
            // @ts-expect-error
            window.frappePushNotification
                .disableNotification()
                .then((data: any) => {
                    setPushNotificationsEnabled(false) // Disable the switch
                    toast.info("Push notifications disabled")
                })
                .catch((error: any) => {
                    toast.error("There was an error", {
                        description: getErrorMessage(error)
                    }
                    )
                })
        }
    }

    const enablePushNotifications = async () => {
        // @ts-expect-error
        window.frappePushNotification
            .enableNotification()
            .then((data: any) => {
                if (data.permission_granted) {
                    setPushNotificationsEnabled(true)
                    toast.success("Push notifications enabled")
                } else {
                    toast.error("Permission denied for push notifications")
                    setPushNotificationsEnabled(false)
                }
            })
            .catch((error: any) => {
                toast.error("Error enabling push notifications", {
                    description: getErrorMessage(error)
                })
                setPushNotificationsEnabled(false)
            })
    }

    // @ts-expect-error
    if (!window.frappe?.boot.push_relay_server_url && !isPushAvailable) {
        return null
    }
    return (
        <DropdownMenu.Item color='gray'
            onClick={togglePushNotifications}
            className={'flex justify-normal gap-2'}>
            {pushNotificationsEnabled ? <><BsBellSlash size='14' /> Disable Notifications</> : <><BsBell size='14' /> Enable Notifications</>}
        </DropdownMenu.Item>
    )
}

export default PushNotificationToggle