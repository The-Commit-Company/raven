import { useColorScheme } from '@hooks/useColorScheme'
import { FileMessage } from '@raven/types/common/Message'
import { Pressable } from 'react-native'
import DownloadIcon from "@assets/icons/DownloadIcon.svg"
import { Text } from '@components/nativewindui/Text'
import { useLocalSearchParams } from 'expo-router'

interface DownloadMessageFileProps {
    message: FileMessage
    onClose: () => void
}

const DownloadMessageFile = ({ message, onClose }: DownloadMessageFileProps) => {

    const { colors } = useColorScheme()
    const { site_id } = useLocalSearchParams<{ site_id: string }>()

    const downloadFile = () => {
        console.log(site_id)
        console.log(message)
    }

    return (
        <Pressable
            onPress={downloadFile}
            className='flex flex-row items-center gap-3 p-2 rounded-lg ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <DownloadIcon width={18} height={18} fill={colors.icon} />
            <Text className='text-base text-foreground'>Download</Text>
        </Pressable>
    )
}

export default DownloadMessageFile