import { useState, useCallback, useContext, useEffect } from 'react'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { Message } from '@raven/types/common/Message'

export const useMessageSave = (message: Message, owner: string | undefined) => {

    const { call } = useContext(FrappeContext) as FrappeConfig

    const [isSaved, setIsSaved] = useState(JSON.parse(message?._liked_by ?? '[]').includes(owner))
    const [isLoading, setIsLoading] = useState(false)

    const save = useCallback(async (onSuccess: () => void) => {
        if (!message) return

        setIsLoading(true)

        try {
            const response = await call.post('raven.api.raven_message.save_message', {
                message_id: message?.name,
                add: isSaved ? 'No' : 'Yes'
            })

            if (!response?.message) return

            setIsSaved(!isSaved)

            if (isSaved) {
                // toast('Message unsaved')
            } else {
                // toast.success('Message saved')
            }

            onSuccess()
        } catch (e: unknown) {
            // toast.error('Could not perform the action', {
            //     description: getErrorMessage(e as any)
            // })
        } finally {
            setIsLoading(false)
        }
    }, [call, message, isSaved])

    return { save, isSaved, isLoading }
}
