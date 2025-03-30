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
    searchInput: string
    setSearchInput: (value: string) => void
    handleRemoveChannel: (channel: CombinedChannel) => void
    handleBackspace: () => void
    currentUserInfo: RavenUser | undefined
}

export const SelectedChannels = ({
    selectedChannels,
    searchInput,
    setSearchInput,
    handleRemoveChannel,
    handleBackspace,
    currentUserInfo,
}: SelectedChannelsProps) => {
    const { colors } = useColorScheme()

    return (
        <View className={`flex-row items-center justify-start gap-2.5 border border-transparent border-b-border px-3 py-3`}>
            <Text>To:</Text>
            <View className="flex-row flex-wrap items-center gap-2 mr-5">
                {selectedChannels.map((channel: CombinedChannel) => {
                    const isDMChannel = channel.is_direct_message
                    const user = channel.user

                    if (isDMChannel && !user?.enabled) return null

                    return (
                        <TouchableOpacity
                            key={channel.name}
                            className="rounded-md h-7 pr-2.5 flex-row items-center gap-2.5 bg-primary/10"
                            onPress={() => handleRemoveChannel(channel)}
                            activeOpacity={0.7}
                        >
                            {isDMChannel ? (
                                <UserAvatar
                                    src={user?.user_image ?? ""}
                                    alt={user?.full_name ?? ""}
                                    avatarProps={{ className: "w-7 h-full" }}
                                    textProps={{ className: 'text-xs' }}
                                    fallbackProps={{ className: "rounded-l-md rounded-r-none" }}
                                    imageProps={{ className: "rounded-l-full rounded-r-none" }}
                                />
                            ) : (
                                <View className="rounded-l-md h-full w-7 justify-center items-center bg-primary/15">
                                    <ChannelIcon size={15} type={channel.type as string} fill={colors.icon} />
                                </View>
                            )}

                            <Text className="text-xs">
                                {isDMChannel
                                    ? `${user?.full_name}${currentUserInfo?.name === user?.name ? " (You)" : ""}`
                                    : channel.channel_name}
                            </Text>
                            {/* <TouchableOpacity activeOpacity={0.7} onPress={() => handleRemoveChannel(channel)} className="flex justify-center items-center w-5 h-5 rounded-full bg-card ml-1">
                                <CrossIcon color={colors.icon} height={11} width={11} />
                            </TouchableOpacity> */}
                        </TouchableOpacity>
                    )
                })}
                <TextInput
                    autoFocus
                    className="flex-1 dark:text-gray-300"
                    placeholder={selectedChannels.length === 0 ? "Add a channel or DM" : ""}
                    value={searchInput}
                    onChangeText={setSearchInput}
                    onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === "Backspace") handleBackspace()
                    }}
                />
            </View>
        </View>
    )
} 