import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import useIsPushNotificationEnabled from '@/hooks/fetchers/useIsPushNotificationEnabled'
import { __ } from '@/utils/translations'
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
                    toast.info(__("Push notifications disabled"))
                })
                .catch((error: any) => {
                    toast.error(__("There was an error"), {
                        description: getErrorMessage(error)
                    }
                    )
                })
        }
    }

    const enablePushNotifications = async () => {


        toast.promise(
            // @ts-expect-error
            window.frappePushNotification
                .enableNotification()
                .then((data: any) => {
                    if (data.permission_granted) {
                        setPushNotificationsEnabled(true)
                    } else {
                        setPushNotificationsEnabled(false)
                        throw new Error("Permission denied for push notifications")
                    }
                })
                .catch((error: any) => {
                    setPushNotificationsEnabled(false)
                    throw error
                })
            , {
                success: __("Push notifications enabled"),
                loading: __("Enabling..."),
                error: (e: Error) => e.message
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
            {pushNotificationsEnabled ? <><BsBellSlash size='14' /> {__("Disable Notifications")}</> : <><BsBell size='14' /> {__("Enable Notifications")}</>}
        </DropdownMenu.Item>
    )
}

export default PushNotificationToggle