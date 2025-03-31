import { TouchableOpacity, View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { useColorScheme } from '@hooks/useColorScheme'
import UserIcon from '@assets/icons/UserIcon.svg'
import { router } from 'expo-router'

const UserFullName = () => {
    const { myProfile } = useCurrentRavenUser()
    const { colors } = useColorScheme()

    const handleGoToFullNameUpdate = () => {
        router.push('./fullname', {
            relativeToDirectory: true
        })
    }

    return (
        <View>
            <View className='flex flex-row py-2.5 px-4 rounded-xl items-center justify-between bg-background dark:bg-card'>
                <View className='flex-row items-center gap-2'>
                    <UserIcon height={18} width={18} fill={colors.icon} />
                    <Text className='text-base'>Name</Text>
                </View>
                <TouchableOpacity onPress={handleGoToFullNameUpdate}>
                    <Text className='text-base text-foreground'>{myProfile?.full_name}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default UserFullName