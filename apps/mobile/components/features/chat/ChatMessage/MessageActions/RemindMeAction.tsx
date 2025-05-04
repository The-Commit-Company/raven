
import { router } from 'expo-router'
import { useColorScheme } from '@hooks/useColorScheme'
import { Message } from '@raven/types/common/Message'
import ActionButton from '@components/common/Buttons/ActionButton'
import ClockIcon from '@assets/icons/ClockIcon.svg'

interface RemindMeActionProps {
    message: Message
    onClose: () => void
}

const RemindMeAction = ({ message, onClose }: RemindMeActionProps) => {

    const { colors } = useColorScheme()

    const onPress = () => {
        router.push(`../(tabs)/home/new-reminder?message_id=${message.name}`)
        onClose()
    }

    return (
        <ActionButton
            onPress={onPress}
            icon={<ClockIcon width={18} height={18} fill={colors.icon} />}
            text='Remind me about this'
        />
    )
}

export default RemindMeAction