import { useColorScheme } from '@hooks/useColorScheme'
import { FileMessage } from '@raven/types/common/Message'
import { Pressable } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import useFileShare from '@hooks/useFileShare'
import { toast } from 'sonner-native'
import ShareIcon from "@assets/icons/ShareIcon.svg"

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
        <Pressable
            onPress={downloadFile}
            className='flex flex-row items-center gap-3 p-2 rounded-lg ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <ShareIcon width={18} height={18} color={colors.icon} />
            <Text className='text-base text-foreground'>Share</Text>
        </Pressable>
    )
}

export default ShareMessageFile