import { useColorScheme } from '@hooks/useColorScheme'
import { FileMessage } from '@raven/types/common/Message'
import useFileShare from '@hooks/useFileShare'
import { toast } from 'sonner-native'
import ShareIcon from "@assets/icons/ShareIcon.svg"
import ActionButton from '@components/common/Buttons/ActionButton'
import { useTranslation } from 'react-i18next'

interface DownloadMessageFileProps {
    message: FileMessage
    onClose: () => void
}

const ShareMessageFile = ({ message, onClose }: DownloadMessageFileProps) => {

    const { t } = useTranslation()
    const { colors } = useColorScheme()

    const { shareFile } = useFileShare(message.file)

    const downloadFile = () => {
        shareFile()
            .then(() => {
                onClose()
            })
            .catch((error) => {
                toast.error(t('media.shareFileFailed'))
            })
    }

    return (
        <ActionButton
            icon={<ShareIcon width={18} height={18} color={colors.icon} />}
            text={t('messages.share')}
            onPress={downloadFile}
        />
    )
}

export default ShareMessageFile