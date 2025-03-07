import { Divider } from "@components/layout/Divider"
import { SearchInput } from "@components/nativewindui/SearchInput"
import { useColorScheme } from "@hooks/useColorScheme"
import useUnreadMessageCount from "@hooks/useUnreadMessageCount"
import { ChannelListContext, ChannelListContextType } from "@raven/lib/providers/ChannelListProvider"
import { DMChannelListItem } from "@raven/types/common/ChannelListItem"
import { useContext, useMemo } from "react"
import { View, Text } from "react-native"
import DMRow from "./DMRow"
import { LegendList } from "@legendapp/list"

const AllDMsList = () => {
    const { dm_channels } = useContext(ChannelListContext) as ChannelListContextType
    const unread_count = useUnreadMessageCount()

    const { colors } = useColorScheme()

    const renderItem = ({ item: dm }: { item: DMChannelListItem }) => {
        const isUnread = unread_count ? unread_count.some(item => item.name === dm.name && item.unread_count > 0) : false
        return <DMRow dm={dm} isUnread={isUnread} />
    }

    const allDMs = useMemo(() => {
        return dm_channels.filter(dm => dm.last_message_details)
    }, [dm_channels])

    return (
        <View className="flex flex-col">
            <View className="p-3">
                <SearchInput style={{ backgroundColor: colors.grey5 }}
                    placeholder="Search"
                    placeholderTextColor={colors.grey} />
            </View>
            <LegendList
                data={allDMs}
                renderItem={renderItem}
                keyExtractor={(item) => item.name}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <Divider prominent size={2} className="min-w-full" />}
                estimatedItemSize={66}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-center text-sm text-muted-foreground">No DMs found</Text>
                    </View>
                }
            />
        </View>
    )
}

export default AllDMsList