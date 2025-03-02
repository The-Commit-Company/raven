import { TouchableOpacity, View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import SmileIcon from '@assets/icons/SmileIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { router } from 'expo-router'

const CustomStatus = () => {

    const { colors } = useColorScheme()
    const { myProfile } = useCurrentRavenUser()

    const handleGoToCustomStatus = () => {
        router.push('./custom-status', {
            relativeToDirectory: true
        })
    }

    return (
        <View>
            <View className='flex flex-row py-2.5 px-4 rounded-xl justify-between bg-background dark:bg-card'>
                <View className='flex-row items-center gap-2'>
                    <SmileIcon height={18} width={18} fill={colors.icon} />
                    <Text className='text-base'>Status</Text>
                </View>
                <TouchableOpacity onPress={handleGoToCustomStatus}>
                    {myProfile?.custom_status ? <Text className='text-base text-muted-foreground' numberOfLines={1}
                        ellipsizeMode="tail" // Add ellipsis at the end
                        style={{ maxWidth: 200 }} >
                        {myProfile?.custom_status}
                    </Text> : <Text className='text-base font-medium text-primary'>Add</Text>}
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default CustomStatus