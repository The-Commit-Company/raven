import { Message } from "@raven/types/common/Message"
import { FrappeContext, FrappeConfig } from "frappe-react-sdk"
import { useContext, useState, useCallback } from "react"
import { toast } from "sonner-native"
import { useTranslation } from "react-i18next"

const useSaveMessage = (message: Message, user?: string, saved = true) => {

    const { t } = useTranslation()
    const { call } = useContext(FrappeContext) as FrappeConfig

    const [isSaved, setIsSaved] = useState(user ? JSON.parse(message?._liked_by ? message?._liked_by : '[]').includes(user) : saved)
    const [isLoading, setIsLoading] = useState(false)

    const save = useCallback(() => {
        if (!message) return

        setIsLoading(true)

        call.post('raven.api.raven_message.save_message', {
            message_id: message?.name,
            add: isSaved ? 'No' : 'Yes'
        }).then((response) => {

            if (!response?.message) return

            if (isSaved) {
                toast(t('messages.messageUnsaved'))
            } else {
                toast.success(t('messages.messageSaved'))
            }

            setIsSaved(!isSaved)

        }).catch((e: unknown) => {
            console.error(e)
            toast.error(t('messages.saveMessageFailed'))
        }).finally(() => {
            setIsLoading(false)
        })
    }, [call, message, isSaved])

    return { save, isSaved, isLoading }
}

export default useSaveMessage