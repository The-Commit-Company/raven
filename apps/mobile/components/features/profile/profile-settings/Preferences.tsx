import { Pressable, View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import SettingsIcon from '@assets/icons/SettingsIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg'
import { router } from 'expo-router'

const Preferences = () => {

    const { colors } = useColorScheme()

    const handleGoToCustomStatus = () => {
        router.push('./preferences', {
            relativeToDirectory: true
        })
    }

    return (
        <Pressable onPress={handleGoToCustomStatus} className='bg-background dark:bg-card rounded-xl active:bg-card-background/50 dark:active:bg-card/80'>
            <View className='flex flex-row py-0 pl-4 pr-2 items-center justify-between'>
                <View className='flex-row items-center gap-2 py-2.5'>
                    <SettingsIcon height={18} width={18} color={colors.icon} />
                    <Text className='text-base'>Preferences</Text>
                </View>
                <View className='flex-row h-10 items-center'>
                    <ChevronRightIcon height={28} width={28} fill={colors.greyText} opacity={0.8} />
                </View>
            </View>
        </Pressable>
    )
}

export default Preferences