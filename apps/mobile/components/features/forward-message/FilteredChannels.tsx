import { View } from 'react-native'
import { LegendList } from '@legendapp/list'
import { ChannelRow } from './ChannelRow'
import { RavenUser } from '@raven/types/Raven/RavenUser'
import { CombinedChannel } from './ForwardMessage'

interface FilteredChannelsProps {
    filteredChannels: CombinedChannel[]
    handleChannelSelect: (channel: CombinedChannel) => void
    currentUserInfo: RavenUser | undefined
}

export const FilteredChannels = ({
    filteredChannels,
    handleChannelSelect,
    currentUserInfo
}: FilteredChannelsProps) => {
    return (
        <View className="flex-1 py-2">
            <LegendList
                data={filteredChannels}
                renderItem={({ item }) => (
                    <ChannelRow
                        item={item}
                        handleChannelSelect={handleChannelSelect}
                        currentUserInfo={currentUserInfo}
                    />
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