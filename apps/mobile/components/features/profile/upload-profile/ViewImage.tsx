import { router } from 'expo-router'
import { Text } from '@components/nativewindui/Text'
import { useColorScheme } from '@hooks/useColorScheme'
import EyeIcon from '@assets/icons/EyeIcon.svg'
import { Pressable } from 'react-native'

interface ViewImageProps {
    uri: string
    onSheetClose: (isMutate?: boolean) => void
}

const ViewImage = ({ uri, onSheetClose }: ViewImageProps) => {

    const { colors } = useColorScheme()

    const openViewer = () => {
        router.push({
            pathname: `./../../chat/[id]/file-viewer`,
            params: { uri }
        }, { relativeToDirectory: true })
        onSheetClose(false)
    }

    return (
        <Pressable
            onPress={openViewer}
            className='flex flex-row w-full items-center gap-2 p-2 rounded-lg ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <EyeIcon height={20} width={20} color={colors.icon} />
            <Text className='text-base text-foreground'>View Image</Text>
        </Pressable>
    )
}

export default ViewImage