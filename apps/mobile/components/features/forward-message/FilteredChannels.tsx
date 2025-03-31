import { View } from 'react-native'
import { LegendList } from '@legendapp/list'
import { ChannelRow } from './ChannelRow'
import { CombinedChannel } from './ForwardMessage'

interface FilteredChannelsProps {
    filteredChannels: CombinedChannel[]
    handleChannelSelect: (channel: CombinedChannel) => void
}

export const FilteredChannels = ({
    filteredChannels,
    handleChannelSelect,
}: FilteredChannelsProps) => {
    return (
        <View className="flex-1 p-2">
            <LegendList
                data={filteredChannels}
                renderItem={({ item }) => (
                    <ChannelRow
                        item={item}
                        handleChannelSelect={handleChannelSelect} />
                )}
                keyExtractor={(item) => item.name}
                estimatedItemSize={48}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                recycleItems
            />
        </View>
    )
} 