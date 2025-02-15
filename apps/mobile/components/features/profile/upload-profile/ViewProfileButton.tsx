import { router } from 'expo-router'
import { Button } from '@components/nativewindui/Button'
import { Text } from '@components/nativewindui/Text'
import { useColorScheme } from '@hooks/useColorScheme'
import EyeIcon from '@assets/icons/EyeIcon.svg'

interface ViewProfileButtonProps {
    uri: string
    onSheetClose: (isMutate?: boolean) => void
}

const ViewProfileButton = ({ uri, onSheetClose }: ViewProfileButtonProps) => {

    const { colors } = useColorScheme()

    const openViewer = () => {

        router.push({
            pathname: `./../../chat/[id]/file-viewer`, // need to make file-viewer page common
            params: { uri }
        }, { relativeToDirectory: true })

        onSheetClose(false)
    }

    return (
        <Button
            onPress={openViewer}
            className="w-full justify-start"
            variant='plain'
            size="icon"
        >
            <EyeIcon height={20} width={20} fill={colors.icon} />
            <Text className="text-base font-normal ml-2">View photo</Text>
        </Button>
    )
}

export default ViewProfileButton