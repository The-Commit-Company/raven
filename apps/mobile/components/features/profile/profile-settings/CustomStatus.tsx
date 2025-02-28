import { View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import SmileIcon from '@assets/icons/SmileIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'

const CustomStatus = () => {
    const { colors } = useColorScheme()
    const { myProfile } = useCurrentRavenUser()
    return (
        <View>
            <View className='flex flex-row py-2.5 px-4 rounded-xl justify-between bg-background dark:bg-card'>
                <View className='flex-row items-center gap-2'>
                    <SmileIcon height={18} width={18} fill={colors.icon} />
                    <Text className='text-base'>Status</Text>
                </View>
                {myProfile?.custom_status ? <Text className='text-sm text-foreground'>{myProfile?.custom_status}</Text> : <Text className='text-sm text-primary'>Add</Text>}
            </View>
        </View>
    )
}

export default CustomStatus