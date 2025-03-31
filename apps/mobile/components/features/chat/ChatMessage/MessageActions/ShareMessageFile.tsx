import { useColorScheme } from '@hooks/useColorScheme'
import { FileMessage } from '@raven/types/common/Message'
import useFileShare from '@hooks/useFileShare'
import { toast } from 'sonner-native'
import ShareIcon from "@assets/icons/ShareIcon.svg"
import ActionButton from '@components/common/Buttons/ActionButton'

interface DownloadMessageFileProps {
    message: FileMessage
    onClose: () => void
}

const ShareMessageFile = ({ message, onClose }: DownloadMessageFileProps) => {

    const { colors } = useColorScheme()

    const { shareFile } = useFileShare(message.file)

    const downloadFile = () => {
        shareFile()
            .then(() => {
                onClose()
            })
            .catch((error) => {
                toast.error('There was an error sharing the file. Please try again.')
            })
    }

    return (
        <ActionButton
            icon={<ShareIcon width={18} height={18} color={colors.icon} />}
            text='Share'
            onPress={downloadFile}
        />
    )
}

export default ShareMessageFile