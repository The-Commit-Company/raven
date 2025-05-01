import { useState, useMemo, useCallback, useEffect, useContext } from "react"
import { View, KeyboardAvoidingView, Platform, Pressable, Keyboard } from "react-native"
import { useNavigation } from "expo-router"
import { router } from "expo-router"
import { useDebounce } from "@raven/lib/hooks/useDebounce"
import { useChannelList } from "@raven/lib/providers/ChannelListProvider"
import { useColorScheme } from "@hooks/useColorScheme"
import { useFrappePostCall } from "frappe-react-sdk"
import { ActivityIndicator } from "@components/nativewindui/ActivityIndicator"
import { toast } from "sonner-native"
import HeaderBackButton from "@components/common/Buttons/HeaderBackButton"
import { UserListContext } from "@raven/lib/providers/UserListProvider"
import { SelectedChannels } from "./SelectedChannels"
import { FilteredChannels } from "./FilteredChannels"
import clsx from "clsx"
import { Message } from "@raven/types/common/Message"
import { UserFields } from "@raven/types/common/UserFields"
import ForwardMessageIcon from '@assets/icons/HollowSendIcon.svg'
import { Divider } from "@components/layout/Divider"

export type CombinedChannel = {
    name: string
    channel_name: string
    is_direct_message?: boolean
    type?: string
    user?: UserFields
}

interface ForwardMessageProps {
    message: Message
}

export function ForwardMessage({ message }: ForwardMessageProps) {
    const { colors } = useColorScheme()
    const navigation = useNavigation()
    const { channels } = useChannelList()
    const [selectedChannels, setSelectedChannels] = useState<CombinedChannel[]>([])
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearchInput = useDebounce(searchInput, 200)

    const users = useContext(UserListContext)

    const combinedChannels = useMemo((): CombinedChannel[] => {
        const channelsList = channels.map(channel => ({
            ...channel,
            name: channel.name,
            channel_name: channel.channel_name,
            is_direct_message: false
        }));

        const nonBotUsers = Array.from(users.enabledUsers.values()).filter((user) => user.type !== "Bot")

        const usersList = nonBotUsers.map((user): CombinedChannel => ({
            name: user.name,
            channel_name: user.full_name,
            is_direct_message: true,
            user: user
        }));

        return [...channelsList, ...usersList];
    }, [channels, users.enabledUsers]);

    const filteredChannels = useMemo(() => {
        const nonSelectedChannels = combinedChannels.filter(
            channel => !selectedChannels.some(selected => selected.name === channel.name)
        );

        return nonSelectedChannels.filter((channel) =>
            channel.channel_name
                .toLowerCase()
                .includes(debouncedSearchInput.toLowerCase())
        );
    }, [combinedChannels, debouncedSearchInput, selectedChannels]);

    const handleChannelSelect = useCallback((channel: CombinedChannel) => {
        Keyboard.dismiss();

        setSelectedChannels((prev) => {
            const isSelected = prev.find((ch) => ch.name === channel.name);
            if (isSelected) {
                return prev.filter((ch) => ch.name !== channel.name);
            } else {
                return [...prev, channel];
            }
        });

        setSearchInput('')
    }, []);

    const handleBackspace = useCallback(() => {
        if (searchInput === "" && selectedChannels.length > 0) {
            setSelectedChannels((prev) => prev.slice(0, -1))
        }
    }, [searchInput, selectedChannels.length]);

    const handleRemoveChannel = useCallback((channel: CombinedChannel) => {
        setSelectedChannels((prev) => prev.filter((ch) => ch.name !== channel.name))
    }, []);

    const { call, error, loading: isForwarding } = useFrappePostCall('raven.api.raven_message.forward_message')

    const onForwardMessage = useCallback(() => {
        if (selectedChannels.length > 0) {
            call({
                'message_receivers': selectedChannels.map((channel: CombinedChannel) => {
                    if (channel.is_direct_message && channel.user) {
                        return channel.user;
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
    }, [selectedChannels, message, call]);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: "Forward Message",
            headerStyle: {
                backgroundColor: colors.background
            },
            headerRight: () => (
                <Pressable
                    className={clsx(isForwarding || !selectedChannels.length ? "opacity-45" : "rounded-full ios:active:bg-linkColor", "p-2.5")}
                    disabled={isForwarding || !selectedChannels.length}
                    onPress={onForwardMessage}
                    android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
                    hitSlop={10}
                >
                    {isForwarding && !error ? <ActivityIndicator size="small" color={colors.primary} /> : <ForwardMessageIcon fill={colors.icon} height={22} width={22} />}
                </Pressable>
            ),
            headerLeft: () => <HeaderBackButton />,
        })
    }, [navigation, selectedChannels, isForwarding, error, colors.primary, onForwardMessage]);

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
        >
            <View className="flex-1">
                <SelectedChannels
                    selectedChannels={selectedChannels}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    handleRemoveChannel={handleRemoveChannel}
                    handleBackspace={handleBackspace}
                />
                <Divider prominent />
                <FilteredChannels
                    filteredChannels={filteredChannels}
                    handleChannelSelect={handleChannelSelect}
                />
            </View>
        </KeyboardAvoidingView>
    )
} 