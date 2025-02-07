import { ChannelListItem } from '@raven/types/common/ChannelListItem'
import { FrappeDoc } from 'frappe-react-sdk'
import { View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import { ChannelIcon } from '@components/features/channels/ChannelList/ChannelIcon'
import { useColorScheme } from '@hooks/useColorScheme'
import { Button } from '@components/nativewindui/Button'
import { router } from 'expo-router'

const ChannelBaseDetails = ({ channelData }: { channelData: FrappeDoc<ChannelListItem> | undefined }) => {

    const { colors } = useColorScheme()

    return (
        <View className="flex-col gap-2">
            <View className="flex-row justify-between items-center">
                <View className='flex-row items-center align-baseline gap-1'>
                    <ChannelIcon size={20} type={channelData?.type ?? 'Public'} fill={colors.foreground} />
                    <Text className='text-lg font-semibold'>{channelData?.channel_name}</Text>
                </View>
                <Button variant="plain" size="none"
                    onPress={() => { router.push(`../edit-channel-details`, { relativeToDirectory: true }) }}>
                    <Text className='text-sm font-medium text-primary mr-1'>Edit</Text>
                </Button>
            </View>
            {channelData?.channel_description && (
                <View className="flex items-start gap-1.5">
                    <Text className='text-sm font-medium'>Description:</Text>
                    <Text className='text-sm text-muted-foreground'>{channelData?.channel_description}</Text>
                </View>
            )}
        </View>
    )
}

export default ChannelBaseDetails