import { useColorScheme } from '@hooks/useColorScheme'
import { FileMessage } from '@raven/types/common/Message'
import PaperClipIcon from "@assets/icons/PaperClipIcon.svg"
import { toast } from 'sonner-native'
import * as Clipboard from 'expo-clipboard'
import useSiteContext from '@hooks/useSiteContext'
import ActionButton from '@components/common/Buttons/ActionButton'
import { __ } from '@lib/i18n';
interface CopyFileMessageLinkProps {
    message: FileMessage
    onClose: () => void
}

const CopyFileMessageLink = ({ message, onClose }: CopyFileMessageLinkProps) => {
const { colors } = useColorScheme()

    const siteData = useSiteContext()

    const copyLink = () => {
        if (message.file.startsWith('http') || message.file.startsWith('https')) {
            Clipboard.setStringAsync(message.file)
        }
        else {
            Clipboard.setStringAsync(siteData?.url + message.file.split('?')[0])
        }
        toast.success(__("Link copied to clipboard"))
        onClose()
    }

    return (
        <ActionButton
            onPress={copyLink}
            icon={<PaperClipIcon width={18} height={18} fill={colors.icon} />}
            text={__("Copy file link")}
        />
    )
}

export default CopyFileMessageLink