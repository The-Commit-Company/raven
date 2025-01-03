import { View, Platform } from "react-native"
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
import { ChangeChannelTypeSheet, ChannelSettingsDataItem, getChangeChannelType } from "@components/features/channel-settings/ChangeChannelType";
import { ChannelListItem } from "@raven/types/common/ChannelListItem";
import { useColorScheme } from "@hooks/useColorScheme";

const SCREEN_OPTIONS = {
    title: 'Channel Settings',
    headerTransparent: Platform.OS === 'ios',
    headerBlurEffect: 'systemMaterial',
} as const;

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
        {
            fields: ['type', 'channel_name', 'name']
        },
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

    const channelSettingsData: (string | ChannelSettingsDataItem)[] = [
        'Channel Settings',
        ...changeChannelTypeButtons,
        {
            id: 'archive',
            title: 'Archive Channel',
            icon: <ArchiveIcon fill={colors.icon} />,
            onPress: () => archiveSheetRef.current?.present(),
            titleClassName: 'text-lg',
        },
        {
            id: 'delete',
            title: 'Delete Channel',
            icon: <TrashIcon fill={'rgb(185, 28, 28)'} />,
            onPress: () => deleteSheetRef.current?.present(),
            titleClassName: 'text-lg text-red-700'
        },
        {
            id: 'members',
            title: 'View Members',
            onPress: () => router.push(`../channel-settings-members`, { relativeToDirectory: true }),
            titleClassName: 'text-lg'
        }
    ];

    return (
        <>
            <Stack.Screen options={SCREEN_OPTIONS} />
            <List
                variant="insets"
                data={channelSettingsData as ChannelSettingsDataItem[]}
                sectionHeaderAsGap={Platform.OS === 'ios'}
                estimatedItemSize={64}
                renderItem={renderItem}
                ListFooterComponent={<ListFooterComponent />}
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

const ListFooterComponent = () => {
    return (
        <View className="py-4 px-1 gap-0.5">
            <Text className="text-muted-foreground text-sm">
                Only channel admins are allowed to change the channel settings
            </Text>
            <Text className="text-muted-foreground text-sm">
                General channel cannot be modified/removed
            </Text>
        </View>
    )
}

function Item({ info }: { info: ListRenderItemInfo<ChannelSettingsDataItem> }) {

    if (typeof info.item === 'string') {
        return <ListSectionHeader {...info} />;
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

export default ChannelSettings;