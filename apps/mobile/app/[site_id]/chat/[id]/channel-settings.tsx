import { View, Platform } from "react-native";
import { Text } from "@components/nativewindui/Text";
import { router, useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { DeleteChannel } from "@components/features/channel-settings/DeleteChannelModal";
import { useFrappeGetDoc } from "frappe-react-sdk";
import { ChannelListItem } from "@raven/types/common/ChannelListItem";
import { MembersTray } from "@components/features/channel-settings/MembersTray";
import PushNotifications from "@components/features/channel-settings/PushNotifications";
import { useColorScheme } from "@hooks/useColorScheme";
import ChannelCreator from "@components/features/channel-settings/BaseDetails/ChannelCreator";
import { Divider } from "@components/layout/Divider";
import ChannelBaseDetails from "@components/features/channel-settings/BaseDetails/ChannelBaseDetails";
import LeaveChannel from "@components/features/channel-settings/LeaveChannel";
import ArchiveChannel from "@components/features/channel-settings/ArchiveChannel";
import HeaderBackButton from "@components/common/Buttons/HeaderBackButton";
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser";
import { useFetchChannelMembers } from "@raven/lib/hooks/useFetchChannelMembers";
import { ChangeChannelType } from "@components/features/channel-settings/ChangeChannelType";
import CommonErrorBoundary from "@components/common/CommonErrorBoundary";

const ChannelSettings = () => {

    const { id } = useLocalSearchParams()
    const { colors, isDarkColorScheme } = useColorScheme()
    const { data: channelData } = useFrappeGetDoc<ChannelListItem>('Raven Channel', id as string)
    const { myProfile: currentUserInfo } = useCurrentRavenUser()
    const { channelMembers } = useFetchChannelMembers(id as string ?? "")
    const isAllowed = channelMembers[currentUserInfo?.name ?? ""]?.is_admin === 1

    return (
        <>
            <Stack.Screen options={{
                headerStyle: { backgroundColor: isDarkColorScheme ? colors.background : colors.card },
                headerLeft: Platform.OS === 'ios' ? () => <HeaderBackButton /> : undefined,
                headerTitle: () => <Text className='ml-2 text-base font-semibold'>Channel Info</Text>,
                // headerRight: () => (
                //     <TouchableOpacity hitSlop={10}>
                //         <ThreeHorizontalDots height={20} width={20} color={colors.foreground} />
                //     </TouchableOpacity>
                // )
            }} />
            <View className="flex-1 bg-card dark:bg-background">
                <View className="flex-col gap-5">
                    <ChannelBaseDetails channelData={channelData} />
                    <Divider className='mx-0' prominent />
                    <MembersTray onViewAll={() => router.push(`../channel-members`, { relativeToDirectory: true })} />
                    <Divider className='mx-0' prominent />
                    {isAllowed ?
                        <View className='flex flex-col gap-4 px-3'>
                            <View className='flex flex-col gap-0.5'>
                                <Text className='pl-2 pb-1 text-xs text-muted-foreground/80'>Settings</Text>
                                <PushNotifications channelID={id as string} />
                                <ChangeChannelType channelData={channelData} />
                            </View>
                            <View className='flex flex-col gap-0.5'>
                                <Text className='pl-2 pb-1 text-xs text-muted-foreground/80'>Danger Zone</Text>
                                <ArchiveChannel channel={channelData} />
                                <LeaveChannel channel={channelData} />
                                <DeleteChannel channelData={channelData} />
                            </View>
                        </View>
                        :
                        <View className='flex flex-col gap-4 px-3'>
                            <View className='flex flex-col gap-0.5'>
                                <Text className='pl-2 pb-1 text-xs text-muted-foreground/80'>Settings</Text>
                                <PushNotifications channelID={id as string} />
                            </View>
                            {channelData?.type !== 'Open' && <View className='flex flex-col gap-0.5'>
                                <Text className='pl-2 pb-1 text-xs text-muted-foreground/80'>Danger Zone</Text>
                                <LeaveChannel channel={channelData} />
                            </View>}
                        </View>
                    }
                    <ChannelCreator channelData={channelData} />
                </View>
            </View>
        </>
    )
}

export default ChannelSettings

export const ErrorBoundary = CommonErrorBoundary