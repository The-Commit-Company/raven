import { View } from 'react-native'
import { ChannelListItem } from '@raven/types/common/ChannelListItem'
import { Text } from '@components/nativewindui/Text'
import { useGetUser } from '@raven/lib/hooks/useGetUser'

interface CreatedByProps {
    channelData: ChannelListItem
}

const CreatedBy = ({ channelData }: CreatedByProps) => {

    const channelOwner = useGetUser(channelData?.owner ?? "")

    return (
        <View className='px-3 py-2 bg-card rounded-lg flex-row items-center'>
            {channelData?.owner && <Text className='text-sm'>{channelOwner?.full_name ?? channelData?.owner}</Text>}
            {channelData?.creation && <Text className='text-sm'> on <Text className='text-gray-500 text-sm'>{formatDate(channelData?.creation)}</Text></Text>}
        </View>
    )
}

export default CreatedBy

export function formatDate(timestamp: string): string {
    const date = new Date(timestamp);


    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();


    const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    const dayWithSuffix = day + getOrdinalSuffix(day);
    return `${dayWithSuffix} ${month} ${year}`;
}