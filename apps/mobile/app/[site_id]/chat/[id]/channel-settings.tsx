import { View, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { Text } from "@components/nativewindui/Text";
import { router, useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { DeleteChannelModal } from "@components/features/channel-settings/DeleteChannelModal";
import { useFrappeGetDoc } from "frappe-react-sdk";
import TrashIcon from '@assets/icons/TrashIcon.svg';
import LockIcon from '@assets/icons/LockIcon.svg';
import GlobeIcon from '@assets/icons/GlobeIcon.svg';
import HashIcon from '@assets/icons/HashIcon.svg';
import { useSheetRef } from "@components/nativewindui/Sheet";
import { ChangeChannelTypeSheet, getChangeChannelType } from "@components/features/channel-settings/ChangeChannelType";
import { ChannelListItem } from "@raven/types/common/ChannelListItem";
import { MembersTray } from "@components/features/channel-settings/MembersTray";
import PushNotifications from "@components/features/channel-settings/PushNotifications";
import ThreeHorizontalDots from "@assets/icons/ThreeHorizontalDots.svg";
import { useColorScheme } from "@hooks/useColorScheme";
import ChannelCreator from "@components/features/channel-settings/BaseDetails/ChannelCreator";
import { Divider } from "@components/layout/Divider";
import ChannelBaseDetails from "@components/features/channel-settings/BaseDetails/ChannelBaseDetails";
import LeaveChannel from "@components/features/channel-settings/LeaveChannel";
import ArchiveChannel from "@components/features/channel-settings/ArchiveChannel";
import HeaderBackButton from "@components/common/HeaderBackButton";

const ChannelSettings = () => {

    const { id } = useLocalSearchParams()
    const deleteSheetRef = useSheetRef()
    const bottomSheetModalRef = useSheetRef()
    const { colors } = useColorScheme()

    const { data: channelData } = useFrappeGetDoc<ChannelListItem>('Raven Channel', id as string)

    const changeChannelTypeButtons = channelData ? getChangeChannelType({
        channelData,
        bottomSheetModalRef,
        iconMap: {
            'Public': <GlobeIcon height={20} width={20} fill={colors.icon} />,
            'Private': <LockIcon height={20} width={20} fill={colors.icon} />,
            'Open': <HashIcon height={20} width={20} fill={colors.icon} />
        }
    }) : []

    return (
        <>
            <Stack.Screen options={{
                headerStyle: { backgroundColor: colors.background },
                headerLeft: () => <HeaderBackButton />,
                headerTitle: () => <Text className='ml-2 text-base font-semibold'>Channel info</Text>,
                headerRight: () => (
                    <TouchableOpacity hitSlop={10}>
                        <ThreeHorizontalDots height={20} width={20} color={colors.foreground} />
                    </TouchableOpacity>
                )
            }} />
            <View className="flex-1 bg-background">
                <View className="flex-col gap-5">
                    <ChannelBaseDetails channelData={channelData} />
                    <Divider className='mx-0' prominent />
                    <MembersTray onViewAll={() => router.push(`../channel-members`, { relativeToDirectory: true })} />
                    <Divider className='mx-0' prominent />
                    <View className="flex-col gap-2">
                        <Text className="text-[15px] font-medium px-4">Settings</Text>
                        <View className="flex-col pt-1 gap-1">
                            <PushNotifications channelID={id as string} />
                            {changeChannelTypeButtons.map((button) => (
                                <Pressable key={button.id}
                                    onPress={button.onPress}
                                    className="flex-row items-center gap-2 px-4 py-2.5 ios:active:bg-linkColor">
                                    {button.icon}
                                    <Text className="text-base">{button.title}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                    <View className="flex gap-2 px-4 pb-2">
                        <ArchiveChannel channel={channelData} />
                        <LeaveChannel channel={channelData} />
                        <Pressable
                            style={styles.settingsContainer}
                            className='rounded-xl ios:active:bg-red-50 border border-destructive'
                            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
                            onPress={() => deleteSheetRef.current?.present()}>
                            <TrashIcon height={20} width={20} fill={colors.destructive} />
                            <Text className="text-base text-destructive">Delete Channel</Text>
                        </Pressable>
                    </View>
                    <ChannelCreator channelData={channelData} />
                </View>
            </View>
            {channelData && (
                <>
                    <DeleteChannelModal deleteSheetRef={deleteSheetRef} channelData={channelData} />
                    <ChangeChannelTypeSheet channelData={channelData} bottomSheetModalRef={bottomSheetModalRef} />
                </>
            )}
        </>
    )
}

const styles = StyleSheet.create({
    settingsContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12,
    }
})

export default ChannelSettings