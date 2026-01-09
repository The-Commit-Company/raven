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
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

export const ChangeChannelType = ({ channelData }: { channelData: FrappeDoc<ChannelListItem> | undefined }) => {
    const { t } = useTranslation()
    const bottomSheetModalRef = useSheetRef()
    const { colors } = useColorScheme()
    const changeChannelTypeButtons = channelData ? getChangeChannelType({
        channelData,
        bottomSheetModalRef,
        iconMap: {
            'Public': <GlobeIcon height={18} width={18} fill={colors.icon} />,
            'Private': <LockIcon height={18} width={18} fill={colors.icon} />,
            'Open': <HashIcon height={18} width={18} fill={colors.icon} />
        },
        t
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
    const { t } = useTranslation()
    const { mutate } = useSWRConfig()
    const { updateDoc, loading: updatingDoc, error } = useFrappeUpdateDoc();

    const getAlertSubMessage = (newChannelType: ChannelType) => {
        switch (newChannelType) {
            case 'Public':
                return t('channels.convertToPublicInfo');
            case 'Private':
                return t('channels.convertToPrivateInfo');
            case 'Open':
                return t('channels.convertToOpenInfo');
            default:
                return '';
        }
    }

    const getChannelTypeName = (type: ChannelType) => {
        switch (type) {
            case 'Public':
                return t('channels.public');
            case 'Private':
                return t('channels.private');
            case 'Open':
                return t('channels.open');
            default:
                return type.toLowerCase();
        }
    }

    const changeChannelType = (newChannelType: 'Public' | 'Private' | 'Open') => {
        updateDoc("Raven Channel", channelData?.name ?? null, {
            type: newChannelType
        }).then(() => {
            mutate(["channel_members", channelData?.name])
            toast.success(t('channels.channelTypeChanged', { type: getChannelTypeName(newChannelType) }));
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
                                {t('channels.convertToTypeConfirm', { type: getChannelTypeName(props.data?.newChannelType) })}
                            </Text>
                            <Text className="text-sm">{t('channels.convertToTypeWarning', { channelName: channelData?.channel_name, type: getChannelTypeName(props.data?.newChannelType) })}
                            </Text>
                            <Text className="text-sm">
                                {getAlertSubMessage(props.data?.newChannelType)}
                            </Text>
                            <View className="flex-col gap-3 pt-1">
                                <Button onPress={() => changeChannelType(props.data?.newChannelType)}
                                    disabled={updatingDoc}>
                                    <Text>{updatingDoc ? t('channels.converting') : t('common.convert')}</Text>
                                </Button>
                                <Button onPress={handleClose} variant="plain" className="border border-border">
                                    <Text>{t('common.cancel')}</Text>
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
const getChangeChannelType = ({ channelData, bottomSheetModalRef, iconMap, t }: { channelData: ChannelListItem, bottomSheetModalRef: React.RefObject<BottomSheetModal>, iconMap: Record<string, React.ReactNode>, t: TFunction }) => {

    const channelType = channelData?.type as ChannelType

    const channelTypeMap = {
        'Public': ['Private', 'Open'],
        'Private': ['Public', 'Open'],
        'Open': ['Public', 'Private']
    }

    const getChannelTypeName = (type: ChannelType) => {
        switch (type) {
            case 'Public':
                return t('channels.public');
            case 'Private':
                return t('channels.private');
            case 'Open':
                return t('channels.open');
            default:
                return type.toLowerCase();
        }
    }

    const channelTypeList = channelTypeMap[channelType] as ChannelType[]

    const channelSettingsData = channelTypeList.map((type) => {
        return {
            id: type,
            title: t('channels.convertToType', { type: getChannelTypeName(type) }),
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