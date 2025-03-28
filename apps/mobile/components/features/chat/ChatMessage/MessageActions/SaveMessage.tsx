import { Pressable } from 'react-native'
import { Message } from '@raven/types/common/Message'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { useColorScheme } from '@hooks/useColorScheme'
import { Text } from '@components/nativewindui/Text'
import BookmarkIcon from "@assets/icons/BookmarkIcon.svg"
import BookmarkFilledIcon from "@assets/icons/BookmarkFilledIcon.svg"
import useSaveMessage from '@hooks/useSaveMessage'

interface SaveMessageProps {
    message: Message
    onClose: () => void
}

const SaveMessage = ({ message, onClose }: SaveMessageProps) => {

    const { myProfile } = useCurrentRavenUser()
    const { save, isSaved } = useSaveMessage(message, myProfile?.name)
    const { colors } = useColorScheme()

    const handleSaveMessage = () => {
        save()
        onClose()
    }

    return (
        <Pressable
            onPress={handleSaveMessage}
            className='flex-1 flex flex-col items-center gap-3 px-2 py-3 rounded-lg bg-card'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            {isSaved ? <BookmarkFilledIcon width={18} height={18} fill={colors.icon} /> : <BookmarkIcon width={18} height={18} fill={colors.icon} />}
            <Text className='text-[15px] font-medium text-foreground/80'>{isSaved ? 'Unsave' : 'Save'}</Text>
        </Pressable>
    )
}

export default SaveMessage