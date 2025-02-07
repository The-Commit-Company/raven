import { View, TouchableOpacity } from "react-native"
import { Text } from "@components/nativewindui/Text"
import { router, useLocalSearchParams } from "expo-router"
import { Stack } from "expo-router"
import { List, ListItem, ListRenderItemInfo, ListSectionHeader } from "@components/nativewindui/List";
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
import { AboutChannel } from "@components/features/channel-settings/AboutChannel";
import { Button } from "@components/nativewindui/Button";
import PushNotifications from "@components/features/channel-settings/PushNotifications";
import PenIcon from "@assets/icons/PenIcon.svg"
import ChevronLeftIcon from "@assets/icons/ChevronLeftIcon.svg"
import ThreeHorizontalDots from "@assets/icons/ThreeHorizontalDots.svg"
import { useColorScheme } from "@hooks/useColorScheme";
import { useGetUser } from "@raven/lib/hooks/useGetUser";
import ChannelCreator from "@components/features/channel-settings/ChannelCreator";

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

    const channelOwner = useGetUser(channelData?.owner ?? "")

    const channelSettingsData: (string | ChannelSettingsDataItem | ChannelSettingsDataComponent)[] = [
        'Channel Description',
        {
            id: 'ChannelDescription',
            component: <AboutChannel />
        } as ChannelSettingsDataComponent,
        'Channel Members',
        {
            id: 'ChannelMembers',
            component: <MembersTray
                onViewAll={() => { router.push(`../channel-settings-members`, { relativeToDirectory: true }) }}
            />
        } as ChannelSettingsDataComponent,
        {
            id: 'PushNotifications',
            component: <PushNotifications channelID={id as string} />
        } as ChannelSettingsDataComponent,
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
            <View className="flex-1 p-4">
                <ChannelCreator channelData={channelData} />
            </View>

            <List
                variant="insets"
                data={channelSettingsData as ChannelSettingsDataItem[]}
                estimatedItemSize={64}
                renderItem={renderItem}
            />

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
    );
};


function renderItem(info: ListRenderItemInfo<ChannelSettingsDataItem>) {
    return <Item info={info} />;
}

function Item({ info }: { info: ListRenderItemInfo<ChannelSettingsDataItem> }) {

    if (typeof info.item === 'string') {
        return <ListSectionHeader {...info} />;
    }

    if ('component' in info.item) {
        return (
            <View>
                {info.item.component as React.ReactNode}
            </View>
        );
    }

    return (
        <ListItem
            titleClassName={info.item.titleClassName}
            leftView={
                <View className="flex-1 flex-row items-center gap-1 px-2">
                    {info.item.icon}
                </View>
            }
            onPress={info.item.onPress}
            {...info}
        />
    );
}

const ChannelNameEditButton = () => {
    const { colors } = useColorScheme();

    return (
        <Button variant="plain" onPress={() => {
            router.push(`../channel-name-edit`, { relativeToDirectory: true })
        }}>
            <PenIcon width={24} height={24} fill={colors.icon} />
        </Button>
    )
}


export default ChannelSettings;