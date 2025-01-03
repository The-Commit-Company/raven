import { Sheet } from "@components/nativewindui/Sheet";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { View } from "react-native"
import { Button } from "@components/nativewindui/Button";
import { Text } from "@components/nativewindui/Text";
import { ChannelType } from "app/[site_id]/chat/[id]/channel-settings";
import { useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { ChannelListItem } from "@raven/types/common/ChannelListItem";
import { toast } from "sonner-native";

export interface ChannelSettingsDataItem {
    id: string;
    title: string;
    icon?: React.ReactNode;
    onPress: () => void;
    titleClassName?: string;
}

interface ChangeChannelTypeSheetProps {
    channelData: ChannelListItem;
    bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}

export const ChangeChannelTypeSheet = ({ channelData, bottomSheetModalRef }: ChangeChannelTypeSheetProps) => {

    const { mutate } = useSWRConfig()
    const { updateDoc, loading: updatingDoc, error } = useFrappeUpdateDoc();

    const getAlertSubMessage = (newChannelType: ChannelType) => {
        switch (newChannelType) {
            case 'Public':
                return `Anyone from your organisation can join this channel and view its message history. If you make this channel private, it will be visible to anyone who has joined the channel up until that point.`;
            case 'Private':
                return `No changes will be made to the channel's history or members. All files shared in this channel will become private and will be accessible only to the channel members.`;
            case 'Open':
                return `Everyone from your organisation will become a channel member and will be able to view its message history. If you later intend to make this private you will have to manually remove members that should not have access to this channel.`;
            default:
                return '';
        }
    }

    const changeChannelType = (newChannelType: 'Public' | 'Private' | 'Open') => {
        updateDoc("Raven Channel", channelData?.name ?? null, {
            type: newChannelType
        }).then(() => {
            mutate(["channel_members", channelData.name])
            toast.success("Channel changed to " + newChannelType.toLocaleLowerCase());
            handleClose();
        });
    };

    const handleClose = () => {
        bottomSheetModalRef.current?.dismiss();
    }

    return (
        <Sheet ref={bottomSheetModalRef} snapPoints={[500]}  >
            {(props: { data: { newChannelType: ChannelType } } & any) => {
                return (
                    <BottomSheetView
                        {...props}
                        className="gap-3"
                    >
                        <View className="flex-col gap-3 justify-start px-5 pt-5 pb-6">
                            <Text className="text-xl font-cal-sans">
                                Change to a {props.data?.newChannelType} channel?
                            </Text>
                            <Text className="text-sm">
                                {`Please understand that when you make ${channelData?.channel_name} a ${props.data?.newChannelType} channel:`}
                            </Text>
                            <Text
                                className="text-sm"
                            >
                                {getAlertSubMessage(props.data?.newChannelType)}
                            </Text>
                        </View>
                        <View className="gap-3 justify-start px-5">
                            <Button onPress={() => changeChannelType(props.data?.newChannelType)}
                                disabled={updatingDoc}
                            >
                                <Text>
                                    {updatingDoc ? "Saving" : `Change to ${props.data?.newChannelType}`}
                                </Text>
                            </Button>
                            <Button onPress={handleClose} variant="secondary">
                                <Text>
                                    Cancel
                                </Text>
                            </Button>
                        </View>
                    </BottomSheetView>
                );
            }}
        </Sheet>
    );
};

/**
 * channel type can be - Private, Public, Open
 * Change Channel Type would take in current channel type and change it to the next type depending on the current type
 * Example: If current channel type is Public, Change Channel Type would change it to Private or Open, so it returns two list item buttons accordingly
 * For current type Private - it would return Public and Open
 * For current type Open - it would return Public and Private
 * For current type Public - it would return Private and Open
*/
export const getChangeChannelType = ({
    channelData,
    bottomSheetModalRef,
    iconMap
}: {
    channelData: ChannelListItem;
    bottomSheetModalRef: React.RefObject<BottomSheetModal>;
    iconMap: Record<string, React.ReactNode>
}) => {
    const channelType = channelData?.type as ChannelType;

    const channelTypeMap = {
        'Public': ['Private', 'Open'],
        'Private': ['Public', 'Open'],
        'Open': ['Public', 'Private']
    }

    const channelTypeList = channelTypeMap[channelType] as ChannelType[];

    const channelSettingsData: ChannelSettingsDataItem[] = channelTypeList.map((type) => {
        return {
            id: type,
            title: `Change to ${type} Channel`,
            onPress: () => {
                bottomSheetModalRef.current?.present({
                    newChannelType: type,
                });
            },
            icon: iconMap[type],
            titleClassName: 'text-lg',
        }
    });

    return channelSettingsData;
}