import { useColorScheme } from '@hooks/useColorScheme'
import { Message } from '@raven/types/common/Message'
import { router } from 'expo-router'
import ForwardIcon from "@assets/icons/ForwardIcon.svg"
import { ActionButtonLarge } from '@components/common/Buttons/ActionButtonLarge'
import { useTranslation } from 'react-i18next'

interface ForwardMessageProps {
    message: Message
    onClose: () => void
}

const ForwardMessage = ({ message, onClose }: ForwardMessageProps) => {
    const { t } = useTranslation()

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
            text={t('messages.forward')}
            onPress={forwardMessage}
        />
    )
}

export default ForwardMessage