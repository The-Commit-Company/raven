import { Sheet, useSheetRef } from "@components/nativewindui/Sheet";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { View, Pressable } from "react-native";
import { Button } from "@components/nativewindui/Button";
import { Text } from "@components/nativewindui/Text";
import { ChannelListItem } from "@raven/types/common/ChannelListItem";
import { useContext, useState } from "react";
import { FrappeDoc, useFrappeDeleteDoc } from "frappe-react-sdk";
import { toast } from "sonner-native";
import CheckIcon from "@assets/icons/CheckIcon.svg";
import { useColorScheme } from '@hooks/useColorScheme';
import { ChannelListContext, ChannelListContextType } from "@raven/lib/providers/ChannelListProvider";
import { useRouteToHome } from "@hooks/useRouting";
import TrashIcon from '@assets/icons/TrashIcon.svg';
import { __ } from '@lib/i18n';

export const DeleteChannel = ({ channelData }: { channelData: FrappeDoc<ChannelListItem> | undefined }) => {
const deleteSheetRef = useSheetRef()
    const { colors } = useColorScheme()

    return (
        <>
            <Pressable
                className="flex flex-row items-center py-3 px-4 rounded-xl gap-3 bg-background dark:bg-card ios:active:bg-red-50 dark:ios:active:bg-red-100/10"
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
                onPress={() => deleteSheetRef.current?.present()}>
                <TrashIcon height={18} width={18} fill={colors.destructive} />
                <Text className="text-base text-destructive">{__("Delete Channel")}</Text>
            </Pressable>
            <DeleteChannelModal deleteSheetRef={deleteSheetRef} channelData={channelData} />
        </>
    )
}

interface DeleteChannelModalProps {
    deleteSheetRef: React.RefObject<BottomSheetModal>
    channelData: FrappeDoc<ChannelListItem> | undefined
}

const DeleteChannelModal: React.FC<DeleteChannelModalProps> = ({ deleteSheetRef, channelData }) => {
const { deleteDoc, error, loading: deletingDoc } = useFrappeDeleteDoc()
    const { mutate } = useContext(ChannelListContext) as ChannelListContextType

    const [allowDelete, setAllowDelete] = useState(false)

    const { colors } = useColorScheme()

    const goToHome = useRouteToHome()

    const handleDeleteChannel = async () => {
        if (channelData?.name) {
            deleteDoc('Raven Channel', channelData.name)
                .then(() => {
                    toast.success(__("Channel {{channelName}} has been deleted", { channelName: channelData?.channel_name }))
                    mutate()
                    handleClose()
                    goToHome()
                })
                .catch(() => {
                    toast.error(__("Could not delete channel"), {
                        description: error?.httpStatusText
                    })
                })
        }
    };

    const handleClose = () => {
        deleteSheetRef.current?.dismiss()
    }

    const toggleAllowDelete = () => {
        setAllowDelete(!allowDelete)
    }

    return (
        <Sheet ref={deleteSheetRef}>
            {props => {
                return (
                    <BottomSheetView {...props}>
                        <View className="flex-col px-4 gap-3 mt-2 mb-16">
                            <Text className="text-xl font-cal-sans">{__("Delete this Channel?")}</Text>
                            <Text className="text-sm">
                                {__("Please understand that when you delete {{channelName}}", { channelName: '' })}<Text className="text-sm font-semibold">{channelData?.channel_name}</Text>:
                            </Text>
                            <Text className="text-sm">
                                {__("All messages, including files and images will be removed.")} <Text className="text-sm text-muted-foreground">
                                    ({__("You can archive this channel instead to preserve your messages")})
                                </Text>
                            </Text>
                            <Pressable onPress={toggleAllowDelete} className="flex-row gap-2 items-center py-3">
                                {allowDelete ?
                                    <View className="border border-border rounded-full p-0.5">
                                        <CheckIcon fill={colors.icon} height={20} width={20} />
                                    </View>
                                    : <View className="border border-border rounded-full p-3"></View>
                                }
                                <Text className="text-sm">
                                    {__("Yes, I understand, permanently delete this channel")}
                                </Text>
                            </Pressable>
                            <Button onPress={handleDeleteChannel} disabled={!allowDelete || deletingDoc} className="bg-red-600">
                                <Text>{deletingDoc ? __("Deleting...") : __("Delete Channel")}</Text>
                            </Button>
                            <Button onPress={handleClose} variant="plain" className="border border-border">
                                <Text>{__("Cancel")}</Text>
                            </Button>
                        </View>
                    </BottomSheetView>
                )
            }}
        </Sheet>
    )
}