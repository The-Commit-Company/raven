import { View } from 'react-native'
import { ChannelListItem } from '@raven/types/common/ChannelListItem'
import { Text } from '@components/nativewindui/Text'
import { useGetUser } from '@raven/lib/hooks/useGetUser'
import { formatDate } from '@raven/lib/utils/dateConversions'
import { FrappeDoc } from 'frappe-react-sdk'

const ChannelCreator = ({ channelData }: { channelData: FrappeDoc<ChannelListItem> | undefined }) => {

    const channelOwner = useGetUser(channelData?.owner ?? "")

    return (
        <View className='flex-row justify-center items-center gap-1 px-4'>
            {channelData?.owner && <Text className='text-sm font-medium'>{channelOwner?.full_name ?? channelData?.owner}</Text>}
            {channelData?.creation && <Text className='text-muted-foreground text-sm'>created this on {formatDate(channelData?.creation)}.</Text>}
        </View>
    )
}

export default ChannelCreator