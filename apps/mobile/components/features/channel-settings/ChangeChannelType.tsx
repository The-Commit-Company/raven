import { Sheet, useSheetRef } from "@components/nativewindui/Sheet";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Pressable, View } from "react-native"
import { Button } from "@components/nativewindui/Button";
import { Text } from "@components/nativewindui/Text";
import { FrappeDoc, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { ChannelListItem } from "@raven/types/common/ChannelListItem";
import { toast } from "sonner-native";
import GlobeIcon from "@assets/icons/GlobeIcon.svg";
import LockIcon from "@assets/icons/LockIcon.svg";
import HashIcon from "@assets/icons/HashIcon.svg";
import { useColorScheme } from "@hooks/useColorScheme";

export const ChangeChannelType = ({ channelData }: { channelData: FrappeDoc<ChannelListItem> | undefined }) => {

    const bottomSheetModalRef = useSheetRef()
    const { colors } = useColorScheme()
    const changeChannelTypeButtons = channelData ? getChangeChannelType({
        channelData,
        bottomSheetModalRef,
        iconMap: {
            'Public': <GlobeIcon height={18} width={18} fill={colors.icon} />,
            'Private': <LockIcon height={18} width={18} fill={colors.icon} />,
            'Open': <HashIcon height={18} width={18} fill={colors.icon} />
        }
    }) : []

    return (
        <>
            {changeChannelTypeButtons.map((button) => (
                <Pressable key={button.id}
                    onPress={button.onPress}
                    className='flex flex-row items-center py-3 px-4 rounded-xl gap-2 bg-background dark:bg-card active:bg-card-background/50 dark:active:bg-card/80'>
                    {button.icon}
                    <Text className="text-base">{button.title}</Text>
                </Pressable>
            ))}

            <ChangeChannelTypeSheet channelData={channelData} bottomSheetModalRef={bottomSheetModalRef} />
        </>
    )
}


interface ChangeChannelTypeSheetProps {
    channelData: FrappeDoc<ChannelListItem> | undefined;
    bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}

type ChannelType = 'Public' | 'Private' | 'Open';

const ChangeChannelTypeSheet = ({ channelData, bottomSheetModalRef }: ChangeChannelTypeSheetProps) => {

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
            mutate(["channel_members", channelData?.name])
            toast.success("Channel changed to " + newChannelType.toLocaleLowerCase());
            handleClose();
        });
    };

    const handleClose = () => {
        bottomSheetModalRef.current?.dismiss();
    }

    return (
        <Sheet ref={bottomSheetModalRef}>
            {(props: { data: { newChannelType: ChannelType } } & any) => {
                return (
                    <BottomSheetView {...props}>
                        <View className="flex-col px-4 gap-3 mt-2 mb-20">
                            <Text className="text-xl font-cal-sans">
                                Convert to a{props.data?.newChannelType === 'Open' ? 'n' : ''} {props.data?.newChannelType.toLowerCase()} channel?
                            </Text>
                            <Text className="text-sm">Please understand that when you make <Text className="text-sm font-semibold">{channelData?.channel_name}</Text> {`a ${props.data?.newChannelType.toLowerCase()} channel:`}
                            </Text>
                            <Text className="text-sm">
                                {getAlertSubMessage(props.data?.newChannelType)}
                            </Text>
                            <View className="flex-col gap-3 pt-1">
                                <Button onPress={() => changeChannelType(props.data?.newChannelType)}
                                    disabled={updatingDoc}>
                                    <Text>{updatingDoc ? 'Converting...' : 'Convert'}</Text>
                                </Button>
                                <Button onPress={handleClose} variant="plain" className="border border-border">
                                    <Text>Cancel</Text>
                                </Button>
                            </View>
                        </View>
                    </BottomSheetView>
                )
            }}
        </Sheet>
    )
}


/**
 * channel type can be - Private, Public, Open
 * Change Channel Type would take in current channel type and change it to the next type depending on the current type
 * Example: If current channel type is Public, Change Channel Type would change it to Private or Open, so it returns two list item buttons accordingly
 * For current type Private - it would return Public and Open
 * For current type Open - it would return Public and Private
 * For current type Public - it would return Private and Open
*/
const getChangeChannelType = ({ channelData, bottomSheetModalRef, iconMap }: { channelData: ChannelListItem, bottomSheetModalRef: React.RefObject<BottomSheetModal>, iconMap: Record<string, React.ReactNode> }) => {

    const channelType = channelData?.type as ChannelType

    const channelTypeMap = {
        'Public': ['Private', 'Open'],
        'Private': ['Public', 'Open'],
        'Open': ['Public', 'Private']
    }

    const channelTypeList = channelTypeMap[channelType] as ChannelType[]

    const channelSettingsData = channelTypeList.map((type) => {
        return {
            id: type,
            title: `Convert to a${type === 'Open' ? 'n' : ''} ${type.toLowerCase()} channel`,
            onPress: () => {
                bottomSheetModalRef.current?.present({
                    newChannelType: type,
                })
            },
            icon: iconMap[type]
        }
    })

    return channelSettingsData
}