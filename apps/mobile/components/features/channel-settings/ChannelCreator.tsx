import { View } from 'react-native'
import { ChannelListItem } from '@raven/types/common/ChannelListItem'
import { Text } from '@components/nativewindui/Text'
import { useGetUser } from '@raven/lib/hooks/useGetUser'
import { formatDate } from '@raven/lib/utils/dateConversions'
import { FrappeDoc } from 'frappe-react-sdk'

const ChannelCreator = ({ channelData }: { channelData: FrappeDoc<ChannelListItem> | undefined }) => {

    const channelOwner = useGetUser(channelData?.owner ?? "")

    return (
        <View className="flex-col gap-2">
            <Text className="text-sm text-muted-foreground px-1">Created By</Text>
            <View className='px-3 py-2 bg-card rounded-lg flex-row items-center gap-1'>
                {channelData?.owner && <Text className='text-sm'>{channelOwner?.full_name ?? channelData?.owner}</Text>}
                {channelData?.creation && <Text className='text-muted-foreground text-sm'>on {formatDate(channelData?.creation)}</Text>}
            </View>
        </View>
    )
}

export default ChannelCreator