import { useColorScheme } from "@hooks/useColorScheme"
import useUnreadMessageCount from "@hooks/useUnreadMessageCount"
import { ChannelListContext, ChannelListContextType } from "@raven/lib/providers/ChannelListProvider"
import { useContext, useMemo, useState } from "react"
import { View, Text, ActivityIndicator } from "react-native"
import DMRow from "./DMRow"
import ChatOutlineIcon from "@assets/icons/ChatOutlineIcon.svg"
import ErrorBanner from "@components/common/ErrorBanner"
import { Divider } from "@components/layout/Divider"
import { FlashList } from "@shopify/flash-list"
import SearchInput from "@components/common/SearchInput/SearchInput"

const AllDMsList = () => {

    const { dm_channels, error, isLoading } = useContext(ChannelListContext) as ChannelListContextType
    const unread_count = useUnreadMessageCount()

    const allDMs = useMemo(() => {
        return dm_channels.filter(dm => dm.last_message_details)
    }, [dm_channels])

    // TODO: Add search for DMs
    const [searchQuery, setSearchQuery] = useState('')
    const filteredDMs = useMemo(() => {
        return allDMs.filter(dm => dm.peer_user_id.toLowerCase().includes(searchQuery.toLowerCase()))
    }, [allDMs, searchQuery])

    if (isLoading) {
        return <View className="flex-1 justify-center items-center h-full">
            <ActivityIndicator />
        </View>
    }

    if (error) {
        return (
            <ErrorBanner error={error} />
        )
    }

    return (
        <View className="flex flex-col">
            <View className="p-3">
                <SearchInput
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />
            </View>
            <Divider prominent />
            <View className='flex-1'>
                <FlashList
                    data={filteredDMs ?? []}
                    renderItem={({ item }) => {
                        const isUnread = unread_count ? unread_count.some(item => item.unread_count > 0) : false
                        return <DMRow dm={item} isUnread={isUnread} />
                    }}
                    keyExtractor={(item) => item.name}
                    estimatedItemSize={64}
                    ItemSeparatorComponent={() => <Divider />}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<DMListEmptyState searchQuery={searchQuery} />}
                />
                <Divider prominent />
            </View>
        </View>
    )
}

const DMListEmptyState = ({ searchQuery }: { searchQuery?: string }) => {
    const { colors } = useColorScheme()
    return (
        <View className="flex flex-col gap-2 bg-background px-4 py-1">
            <View className="flex flex-row items-center gap-2">
                <ChatOutlineIcon fill={colors.icon} height={20} width={20} />
                <Text className="text-foreground text-base font-medium">
                    {searchQuery ? `No DMs found with "${searchQuery}"` : 'No DMs found'}
                </Text>
            </View>
            <Text className="text-sm text-foreground/60">
                {searchQuery ? 'Try searching for a different user name, or invite this userto Raven' : `Start a new conversation with someone to see it here`}
            </Text>
        </View>
    )
}

export default AllDMsList