import React, { useState, useMemo, useCallback, useEffect } from "react"
import { router, useLocalSearchParams, useNavigation } from "expo-router"
import { TextInput, TouchableOpacity, View, Text, KeyboardAvoidingView, Platform, FlatList, Pressable } from "react-native"
import clsx from "clsx"
import { ChannelListItem, DMChannelListItem } from "@raven/types/common/ChannelListItem"
import { useDebounce } from "@raven/lib/hooks/useDebounce"
import UserAvatar from "@components/layout/UserAvatar"
import { useChannelList } from "@raven/lib/providers/ChannelListProvider"
import { useGetUserRecords } from "@raven/lib/hooks/useGetUserRecords"
import { UserFields } from "@raven/types/common/UserFields"
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"
import { useColorScheme } from "@hooks/useColorScheme"
import SendIcon from "@assets/icons/SendIcon.svg"
import { useFrappePostCall } from "frappe-react-sdk"
import { ActivityIndicator } from "@components/nativewindui/ActivityIndicator"
import { ChannelIcon } from "@components/features/channels/ChannelList/ChannelIcon"
import { formatDate } from "@raven/lib/utils/dateConversions"
import { toast } from "sonner-native"
import HeaderBackButton from "@components/common/HeaderBackButton"
import CrossIcon from '@assets/icons/CrossIcon.svg';
import CommonErrorBoundary from "@components/common/CommonErrorBoundary"

type DMChannelListItemWithUser = DMChannelListItem & {
    user: UserFields
}

function ForwardMessage() {
    const { colors } = useColorScheme()

    const message = useLocalSearchParams()

    const navigation = useNavigation()

    const { channels, dm_channels } = useChannelList()

    const [selectedChannels, setSelectedChannels] = useState<
        (ChannelListItem | DMChannelListItemWithUser)[]
    >([])
    const [isDropdownVisible, setDropdownVisible] = useState(true)
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearchInput = useDebounce(searchInput, 200)

    const { myProfile: currentUserInfo } = useCurrentRavenUser()
    const userRecords = useGetUserRecords()

    const handleChannelSelect = useCallback((channel: any) => {
        setSelectedChannels((prev) => {
            const isSelected = prev.find((ch) => ch.name === channel.name)
            if (isSelected) {
                return prev.filter((ch) => ch.name !== channel.name)
            } else {
                return [...prev, channel]
            }
        })
    }, [])

    const combinedChannels = useMemo(() => {
        return [
            ...channels,
            ...dm_channels.map(dm_channel => {
                return {
                    ...dm_channel,
                    user: {
                        ...userRecords[dm_channel.peer_user_id]
                    }
                }
            }),
        ]
    }, [channels, dm_channels])

    const filteredChannels = useMemo(() => {
        const nonSelectedChannels = combinedChannels.filter(channel => !selectedChannels.some(selected => selected.name === channel.name))
        return nonSelectedChannels.filter((channel) =>
            channel.channel_name
                .toLowerCase()
                .includes(debouncedSearchInput.toLowerCase())
        ) || nonSelectedChannels
    }, [combinedChannels, debouncedSearchInput, selectedChannels])

    const handleBackspace = () => {
        if (searchInput === "" && selectedChannels.length > 0) {
            setSelectedChannels((prev) => prev.slice(0, -1))
        }
    }

    const handleRemoveChannel = useCallback((channel: ChannelListItem | DMChannelListItem) => {
        setSelectedChannels((prev) => prev.filter((ch) => ch.name !== channel.name))
    }, [])

    const { call, error, loading: isForwarding } = useFrappePostCall('raven.api.raven_message.forward_message')

    const onForwardMessage = () => {

        if (selectedChannels.length > 0) {
            call({
                'message_receivers': selectedChannels.map((channel: ChannelListItem | DMChannelListItemWithUser) => {
                    if (channel.is_direct_message) {
                        if ('user' in channel && channel.user) {
                            return { ...channel, ...channel.user };
                        }
                    }
                    return channel;
                }),
                'forwarded_message': message,
            })
                .then(() => {
                    toast.success('Message forwarded successfully!')

                    router.back();
                })
                .catch(() => {
                    toast.error('Failed to forward message')
                });
        }
    }

    useEffect(() => {
        navigation.setOptions({
            headerTitle: "Forward Message",
            headerRight: () => (
                <TouchableOpacity className={clsx(isForwarding || !selectedChannels.length ? "opacity-45" : "")} disabled={isForwarding || !selectedChannels.length} onPress={onForwardMessage} activeOpacity={0.6}>
                    {isForwarding && !error ? <ActivityIndicator size={20} className='text-gray-800 dark:text-white' /> : <SendIcon fill={colors.icon} />}
                </TouchableOpacity>
            ),
            headerLeft: () => <HeaderBackButton />,
        })
    }, [navigation, selectedChannels])

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View className="flex-1">
                <View className={`flex-row items-center justify-start gap-2 border-b-2 ${isDropdownVisible ? "border-gray-200 dark:border-gray-600" : "border-gray-300 dark:border-gray-700"} px-3 py-4`}>
                    <Text className="text-gray-700 dark:text-gray-200">To:</Text>
                    <View className="flex-row flex-wrap items-center gap-2 mr-2">
                        {selectedChannels.map((channel) => {
                            const isDMChannel = channel.is_direct_message
                            const user = (channel as DMChannelListItemWithUser)?.user

                            if (isDMChannel && !user?.enabled) return null

                            return (
                                <View key={channel.name} className="bg-gray-100 dark:bg-gray-900 rounded-md px-2 py-1.5 flex-row items-center gap-2">
                                    {isDMChannel ? (
                                        <UserAvatar
                                            src={user?.user_image ?? ""}
                                            alt={user?.full_name ?? ""}
                                            avatarProps={{ className: "w-6 h-6" }}
                                            fallbackProps={{ className: "rounded-md" }}
                                            imageProps={{ className: "rounded-md" }}
                                        />
                                    ) : (
                                        <View className="w-6 h-6 rounded-md bg-gray-300 dark:bg-gray-800 justify-center items-center">
                                            <ChannelIcon size={15} type={channel.type} fill={colors.icon} />
                                        </View>
                                    )}

                                    <Text className="text-gray-800 dark:text-gray-400">
                                        {isDMChannel
                                            ? `${user?.full_name}${currentUserInfo?.name === user?.name ? " (You)" : ""}`
                                            : channel.channel_name}
                                    </Text>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => handleRemoveChannel(channel)} className="flex justify-center items-center w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-800 ml-1">
                                        <CrossIcon fill={colors.icon} height={11} width={11} />
                                    </TouchableOpacity>
                                </View>
                            )
                        })}
                        <TextInput
                            autoFocus
                            className="flex-1 text-gray-600"
                            placeholder={selectedChannels.length === 0 ? "Add a channel or DM" : ""}
                            value={searchInput}
                            onChangeText={setSearchInput}
                            onFocus={() => setDropdownVisible(true)}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === "Backspace") handleBackspace()
                            }}
                        />
                    </View>
                </View>

                {/* Dropdown */}
                {isDropdownVisible && (
                    <View className="flex-1 px-3 py-2">
                        <FlatList
                            data={filteredChannels}
                            renderItem={({ item }) => (
                                <ChannelRow
                                    item={item}
                                    handleChannelSelect={handleChannelSelect}
                                    currentUserInfo={currentUserInfo}
                                />
                            )}
                            keyExtractor={(item) => item.name}
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                        />
                    </View>
                )}

                {/* Message Preview */}
                {!isDropdownVisible && (
                    <View className="border-l-2 border-gray-300 mx-3 px-3 py-2 mt-5">
                        <Text className="font-bold text-gray-600 dark:text-gray-400 pb-2">{message?.owner ?? ""}</Text>
                        <Text className="text-gray-500">{message?.content ?? ""}</Text>
                        <Text className="text-gray-500 text-xs font-semibold mt-2">{formatDate(message?.creation as string)}</Text>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    )
}

const ChannelRow = React.memo(({ item, handleChannelSelect, currentUserInfo }: any) => {
    const { colors } = useColorScheme()

    const isDMChannel = item.is_direct_message
    const user = item.user

    const handleCheckedChange = useCallback(
        () => handleChannelSelect(item),
        [handleChannelSelect, item]
    )

    if (isDMChannel && !user?.enabled) return null

    return (
        <TouchableOpacity
            className="py-2 flex flex-row items-center gap-3"
            onPress={handleCheckedChange}
            activeOpacity={0.5}
        >
            {isDMChannel ? (
                <UserAvatar
                    src={user?.user_image ?? ""}
                    alt={user?.full_name ?? ""}
                    avatarProps={{ className: "w-8 h-8" }}
                    fallbackProps={{ className: "rounded-md" }}
                    imageProps={{ className: "rounded-md" }}
                />
            ) : (
                <View className="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-900 justify-center items-center">
                    <ChannelIcon size={16} type={item.type} fill={colors.icon} />
                </View>
            )}
            <Text className="text-base dark:text-gray-300">
                {isDMChannel
                    ? `${user?.full_name}${currentUserInfo?.name === user?.name ? " (You)" : ""}`
                    : item.channel_name}
            </Text>
        </TouchableOpacity>
    )
})

export default ForwardMessage

export const ErrorBoundary = CommonErrorBoundary
