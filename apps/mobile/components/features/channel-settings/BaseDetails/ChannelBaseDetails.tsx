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
        <View className="flex-col pt-4 px-4 gap-2">
            <View className="flex-row justify-between items-center">
                <View className='flex-row items-center align-baseline gap-1'>
                    <ChannelIcon size={22} type={channelData?.type ?? 'Public'} fill={colors.foreground} />
                    <Text className='text-[20px] font-semibold'>{channelData?.channel_name}</Text>
                </View>
                <Button variant="plain" size="none"
                    onPress={() => { router.push(`../edit-channel-details`, { relativeToDirectory: true }) }}>
                    <Text className='text-[15px] font-medium text-primary dark:text-secondary mr-1'>Edit</Text>
                </Button>
            </View>
            {channelData?.channel_description && <Text className='text-base font-normal text-muted-foreground'>{channelData?.channel_description}</Text>}
        </View >
    )
}

export default ChannelBaseDetails