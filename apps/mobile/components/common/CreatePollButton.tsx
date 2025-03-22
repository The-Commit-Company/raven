import { router } from "expo-router"
import { useColorScheme } from "@hooks/useColorScheme"
import { Text } from '@components/nativewindui/Text'
import BarChart from "@assets/icons/BarChart.svg"
import { Pressable } from "react-native"

interface CreatePollButtonProps {
    onSheetClose: () => void
}

const CreatePollButton = ({ onSheetClose }: CreatePollButtonProps) => {

    const { colors } = useColorScheme()
    const navigateToCreatePoll = () => {
        router.push("./create-poll", { relativeToDirectory: true })
        onSheetClose()
    }

    return (
        <Pressable
            onPress={navigateToCreatePoll}
            hitSlop={10}
            className='flex flex-row w-full items-center gap-2 p-2 rounded-lg ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <BarChart height={20} width={20} fill={colors.icon} />
            <Text className='text-base text-foreground'>Create Poll</Text>
        </Pressable>
    )
}

export default CreatePollButton