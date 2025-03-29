import { View, TextInput, TouchableOpacity } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import UserAvatar from '@components/layout/UserAvatar'
import { ChannelIcon } from '@components/features/channels/ChannelList/ChannelIcon'
import CrossIcon from '@assets/icons/CrossIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'
import { RavenUser } from '@raven/types/Raven/RavenUser'
import { CombinedChannel } from './ForwardMessage'

interface SelectedChannelsProps {
    selectedChannels: CombinedChannel[]
    isDropdownVisible: boolean
    searchInput: string
    setSearchInput: (value: string) => void
    handleRemoveChannel: (channel: CombinedChannel) => void
    handleBackspace: () => void
    currentUserInfo: RavenUser | undefined
    setDropdownVisible: (value: boolean) => void
}

export const SelectedChannels = ({
    selectedChannels,
    isDropdownVisible,
    searchInput,
    setSearchInput,
    handleRemoveChannel,
    handleBackspace,
    currentUserInfo,
    setDropdownVisible
}: SelectedChannelsProps) => {
    const { colors } = useColorScheme()

    return (
        <View className={`flex-row items-center justify-start gap-2 border-b-2 ${isDropdownVisible ? "border-gray-200 dark:border-gray-600" : "border-gray-300 dark:border-gray-700"} px-3 py-4`}>
            <Text>To:</Text>
            <View className="flex-row flex-wrap items-center gap-2">
                {selectedChannels.map((channel: CombinedChannel) => {
                    const isDMChannel = channel.is_direct_message
                    const user = channel.user

                    if (isDMChannel && !user?.enabled) return null

                    return (
                        <View
                            key={channel.name}
                            className="rounded-full py-1 pl-1 pr-2 flex-row items-center gap-1 border border-border"
                        >
                            {isDMChannel ? (
                                <UserAvatar
                                    src={user?.user_image ?? ""}
                                    alt={user?.full_name ?? ""}
                                    avatarProps={{ className: "w-6 h-6" }}
                                    textProps={{ className: 'text-xs' }}
                                    fallbackProps={{ className: "rounded-full" }}
                                    imageProps={{ className: "rounded-full" }}
                                    rounded
                                />
                            ) : (
                                <View className="w-6 h-6 rounded-full justify-center items-center">
                                    <ChannelIcon size={15} type={channel.type as string} fill={colors.icon} />
                                </View>
                            )}

                            <Text className="text-sm">
                                {isDMChannel
                                    ? `${user?.full_name}${currentUserInfo?.name === user?.name ? " (You)" : ""}`
                                    : channel.channel_name}
                            </Text>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => handleRemoveChannel(channel)} className="flex justify-center items-center w-5 h-5 rounded-full bg-card ml-1">
                                <CrossIcon color={colors.icon} height={11} width={11} />
                            </TouchableOpacity>
                        </View>
                    )
                })}
                <TextInput
                    className="flex-1 dark:text-gray-300"
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
    )
} 