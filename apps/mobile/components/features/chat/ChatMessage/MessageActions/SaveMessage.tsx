import { Message } from '@raven/types/common/Message'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { useColorScheme } from '@hooks/useColorScheme'
import BookmarkIcon from "@assets/icons/BookmarkIcon.svg"
import BookmarkFilledIcon from "@assets/icons/BookmarkFilledIcon.svg"
import { ActionButtonLarge } from '@components/common/Buttons/ActionButtonLarge'
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
        <ActionButtonLarge
            icon={isSaved ? <BookmarkFilledIcon width={18} height={18} fill={colors.icon} /> : <BookmarkIcon width={18} height={18} fill={colors.icon} />}
            text={isSaved ? 'Unsave' : 'Save'}
            onPress={handleSaveMessage}
        />
    )
}

export default SaveMessage