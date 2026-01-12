import { useColorScheme } from '@hooks/useColorScheme'
import { Message } from '@raven/types/common/Message'
import { router } from 'expo-router'
import ForwardIcon from "@assets/icons/ForwardIcon.svg"
import { ActionButtonLarge } from '@components/common/Buttons/ActionButtonLarge'
import { __ } from '@lib/i18n';
interface ForwardMessageProps {
    message: Message
    onClose: () => void
}

const ForwardMessage = ({ message, onClose }: ForwardMessageProps) => {
const forwardMessage = () => {
        router.push({
            pathname: "./forward-message",
            params: { ...message } as any
        }, { relativeToDirectory: true })
        onClose()
    }

    const { colors } = useColorScheme()

    return (
        <ActionButtonLarge
            icon={<ForwardIcon width={18} height={18} color={colors.icon} />}
            text={__("Forward")}
            onPress={forwardMessage}
        />
    )
}

export default ForwardMessage