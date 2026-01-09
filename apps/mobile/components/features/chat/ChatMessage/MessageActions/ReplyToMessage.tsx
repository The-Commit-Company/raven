import { Message } from '@raven/types/common/Message'
import ReplyIcon from "@assets/icons/ReplyIcon.svg"
import { useColorScheme } from '@hooks/useColorScheme'
import { useSetAtom } from 'jotai'
import { selectedReplyMessageAtomFamily } from '@lib/ChatInputUtils'
import useSiteContext from '@hooks/useSiteContext'
import { ActionButtonLarge } from '@components/common/Buttons/ActionButtonLarge'
import { useTranslation } from 'react-i18next'

interface ReplyToMessageProps {
    message: Message
    onClose: () => void
}

const ReplyToMessage = ({ message, onClose }: ReplyToMessageProps) => {

    const { t } = useTranslation()
    const { colors } = useColorScheme()

    const siteInfo = useSiteContext()

    const setSelectedReplyMessage = useSetAtom(selectedReplyMessageAtomFamily(siteInfo?.sitename + message.channel_id))
    const onReplyToMessage = () => {
        setSelectedReplyMessage(message)
        onClose()
    }

    return (
        <ActionButtonLarge
            icon={<ReplyIcon width={18} height={18} color={colors.icon} />}
            text={t('messages.reply')}
            onPress={onReplyToMessage}
        />
    )
}

export default ReplyToMessage