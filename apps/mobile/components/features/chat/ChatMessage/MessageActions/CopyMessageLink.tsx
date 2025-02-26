import { useColorScheme } from '@hooks/useColorScheme'
import { FileMessage } from '@raven/types/common/Message'
import { Pressable } from 'react-native'
import PaperClipIcon from "@assets/icons/PaperClipIcon.svg"
import { Text } from '@components/nativewindui/Text'
import { toast } from 'sonner-native'
import * as Clipboard from 'expo-clipboard'
import { useLocalSearchParams } from 'expo-router'

interface CopyMessageLinkProps {
    message: FileMessage
    onClose: () => void
}

const CopyMessageLink = ({ message, onClose }: CopyMessageLinkProps) => {

    const { colors } = useColorScheme()
    const { site_id } = useLocalSearchParams<{ site_id: string }>()

    const copyLink = () => {
        if (message.file.startsWith('http') || message.file.startsWith('https')) {
            Clipboard.setStringAsync(message.file)
        }
        else {
            Clipboard.setStringAsync('https://' + site_id + message.file)
        }
        toast.success('Link copied')
        onClose()
    }

    return (
        <Pressable
            onPress={copyLink}
            className='flex flex-row items-center gap-3 p-2 rounded-lg ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <PaperClipIcon width={18} height={18} fill={colors.icon} />
            <Text className='text-base text-foreground'>Copy link</Text>
        </Pressable>
    )
}

export default CopyMessageLink