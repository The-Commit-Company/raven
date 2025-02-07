import { View, TouchableOpacity } from "react-native"
import { Text } from "@components/nativewindui/Text"
import { router, useLocalSearchParams } from "expo-router"
import { Stack } from "expo-router"
import { ArchiveChannelModal } from "@components/features/channel-settings/ArchiveChannelModal";
import { DeleteChannelModal } from "@components/features/channel-settings/DeleteChannelModal";
import { useFrappeGetDoc } from "frappe-react-sdk";
import TrashIcon from '@assets/icons/TrashIcon.svg';
import ArchiveIcon from '@assets/icons/ArchiveIcon.svg';
import LockIcon from '@assets/icons/LockIcon.svg';
import GlobeIcon from '@assets/icons/GlobeIcon.svg';
import HashIcon from '@assets/icons/HashIcon.svg';
import { useSheetRef } from "@components/nativewindui/Sheet";
import { ChangeChannelTypeSheet, getChangeChannelType } from "@components/features/channel-settings/ChangeChannelType";
import { ChannelListItem } from "@raven/types/common/ChannelListItem";
import { MembersTray } from "@components/features/channel-settings/MembersTray";
import PushNotifications from "@components/features/channel-settings/PushNotifications";
import ChevronLeftIcon from "@assets/icons/ChevronLeftIcon.svg"
import ThreeHorizontalDots from "@assets/icons/ThreeHorizontalDots.svg"
import { useColorScheme } from "@hooks/useColorScheme";
import ChannelCreator from "@components/features/channel-settings/BaseDetails/ChannelCreator";
import { Divider } from "@components/layout/Divider";
import ChannelBaseDetails from "@components/features/channel-settings/BaseDetails/ChannelBaseDetails";

export type ChannelSettingsDataItem = {
    id: string;
    title: string;
    icon: React.ReactNode;
    onPress: () => void;
    titleClassName: string;
}

export type ChannelSettingsDataComponent = {
    id: string;
    component: React.ReactNode;
}

export type ChannelSettingsListData = (ChannelSettingsDataItem | ChannelSettingsDataComponent)[];

export type ChannelType = 'Public' | 'Private' | 'Open';


const ChannelSettings = () => {
    const { id } = useLocalSearchParams();

    const archiveSheetRef = useSheetRef();
    const deleteSheetRef = useSheetRef();
    const bottomSheetModalRef = useSheetRef();

    const { colors } = useColorScheme()

    const { data: channelData, error, isLoading } = useFrappeGetDoc<ChannelListItem>(
        'Raven Channel',
        id as string,
    );

    const changeChannelTypeButtons = channelData ? getChangeChannelType({
        channelData,
        bottomSheetModalRef,
        iconMap: {
            'Public': <GlobeIcon fill={colors.icon} />,
            'Private': <LockIcon fill={colors.icon} />,
            'Open': <HashIcon fill={colors.icon} />
        }
    }) : [];

    const channelSettingsData: (string | ChannelSettingsDataItem | ChannelSettingsDataComponent)[] = [
        'Channel Settings',
        ...changeChannelTypeButtons as ChannelSettingsListData,
        {
            id: 'ArchiveChannel',
            title: 'Archive Channel',
            onPress: () => archiveSheetRef.current?.present(),
            icon: <ArchiveIcon fill={colors.icon} />,
            titleClassName: 'text-lg',
        } as ChannelSettingsDataItem,
        {
            id: 'DeleteChannel',
            title: 'Delete Channel',
            onPress: () => deleteSheetRef.current?.present(),
            icon: <TrashIcon fill={colors.destructive} />,
            titleClassName: 'text-lg text-destructive',
        } as ChannelSettingsDataItem,
    ];

    return (
        <>
            <Stack.Screen options={{
                headerLeft: () => {
                    return (
                        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
                            <ChevronLeftIcon stroke={colors.foreground} />
                        </TouchableOpacity>
                    )
                },
                headerTitle: () => {
                    return <Text className='ml-2 text-base font-semibold'>Channel Info</Text>
                },
                headerRight: () => {
                    return (
                        <TouchableOpacity hitSlop={10}>
                            <ThreeHorizontalDots height={20} width={20} color={colors.foreground} />
                        </TouchableOpacity>
                    )
                }
            }} />
            <View className="flex-1 bg-card">
                <View className="flex-col p-4 gap-4">
                    <ChannelBaseDetails channelData={channelData} />
                    <Divider className='mx-0' prominent />
                    <MembersTray onViewAll={() => { router.push(`../channel-settings-members`, { relativeToDirectory: true }) }} />
                    <Divider className='mx-0' prominent />
                    <View className="flex-col gap-3">
                        <Text className="text-sm font-medium">Settings</Text>
                        <PushNotifications channelID={id as string} />
                    </View>
                    <ChannelCreator channelData={channelData} />
                </View>
            </View>

            {/* <List
                variant="insets"
                data={channelSettingsData as ChannelSettingsDataItem[]}
                estimatedItemSize={64}
                renderItem={renderItem}
            /> */}

            {
                channelData &&
                <>
                    <ArchiveChannelModal
                        archiveSheetRef={archiveSheetRef}
                        channelData={channelData}
                    />
                    <DeleteChannelModal
                        deleteSheetRef={deleteSheetRef}
                        channelData={channelData}
                    />
                    <ChangeChannelTypeSheet
                        channelData={channelData}
                        bottomSheetModalRef={bottomSheetModalRef}
                    />
                </>
            }
        </>
    )
}

export default ChannelSettings