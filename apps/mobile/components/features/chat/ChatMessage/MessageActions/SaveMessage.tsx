import { Pressable } from 'react-native'
import { useState, useCallback, useContext } from 'react'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { Message } from '@raven/types/common/Message'
import { toast } from 'sonner-native'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { useColorScheme } from '@hooks/useColorScheme'
import { Text } from '@components/nativewindui/Text'
import BookmarkIcon from "@assets/icons/BookmarkIcon.svg"
import BookmarkFilledIcon from "@assets/icons/BookmarkFilledIcon.svg"

interface SaveMessageProps {
    message: Message
    onClose: () => void
}

const SaveMessage = ({ message, onClose }: SaveMessageProps) => {

    const { myProfile } = useCurrentRavenUser()
    const { save, isSaved } = useMessageSave(message, myProfile?.name)
    const { colors } = useColorScheme()

    return (
        <Pressable
            onPress={() => save(onClose)}
            className='flex-1 flex flex-col items-center gap-3 px-2 py-3 rounded-lg bg-card'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            {isSaved ? <BookmarkFilledIcon width={18} height={18} fill={colors.icon} /> : <BookmarkIcon width={18} height={18} fill={colors.icon} />}
            <Text className='text-[15px] font-medium text-foreground/80'>{isSaved ? 'Unsave' : 'Save'}</Text>
        </Pressable>
    )
}

export default SaveMessage

const useMessageSave = (message: Message, owner: string | undefined) => {

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
                toast('Message unsaved')
            } else {
                toast.success('Message saved')
            }

            onSuccess()
        } catch (e: unknown) {
            toast.error('Could not perform the action')
        } finally {
            setIsLoading(false)
        }
    }, [call, message, isSaved])

    return { save, isSaved, isLoading }
}
