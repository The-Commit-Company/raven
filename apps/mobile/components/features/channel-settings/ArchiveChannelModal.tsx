import { Sheet } from "@components/nativewindui/Sheet";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { View } from "react-native";
import { Text } from "@components/nativewindui/Text";
import { Button } from "@components/nativewindui/Button";
import { ChannelListItem } from "@raven/types/common/ChannelListItem";
import { useFrappeUpdateDoc } from "frappe-react-sdk";
import { router } from "expo-router";
import { toast } from 'sonner-native';
import { useContext } from "react";
import { SiteContext } from "app/[site_id]/_layout";

interface ArchiveChannelModalProps {
    archiveSheetRef: React.RefObject<BottomSheetModal>;
    channelData: ChannelListItem;
}

export const ArchiveChannelModal: React.FC<ArchiveChannelModalProps> = ({
    archiveSheetRef,
    channelData
}) => {

    const { updateDoc, loading: archivingDoc, error } = useFrappeUpdateDoc()

    const siteContext = useContext(SiteContext)
    const siteId = siteContext?.sitename

    const handleArchiveChannel = () => {
        updateDoc('Raven Channel', channelData?.name ?? '', {
            is_archived: 1
        }).then(() => {
            handleClose()
            router.replace(`${siteId}/home`)
            toast.success('Channel archived')
        })
    };

    const handleClose = () => {
        archiveSheetRef.current?.dismiss()
    };

    return (
        <Sheet ref={archiveSheetRef} snapPoints={[500]}  >
            {props => {
                return (
                    <BottomSheetView
                        {...props}
                        className="gap-3"
                    >
                        <View className="flex-col gap-3 justify-start px-5 pt-5 pb-6">
                            <Text className="text-xl font-cal-sans">
                                Archive this Channel?
                            </Text>
                            <Text
                                className="text-sm"
                            >
                                Please understand that when you archive {channelData?.channel_name}:
                            </Text>
                            <View
                                className="gap-2 list-inside"
                            >
                                <Text
                                    className="text-sm"
                                >
                                    It will be removed from your channel list
                                </Text>
                                <Text
                                    className="text-sm"
                                >
                                    No one will be able to send messages to this channel
                                </Text>
                            </View>
                            <Text
                                className="text-sm"
                            >
                                You will still be able to find the channel’s contents via search. And you can always unarchive the channel in the future, if you want.
                            </Text>
                        </View>
                        <View className="gap-3 justify-start px-5">
                            <Button
                                onPress={handleArchiveChannel}
                                disabled={archivingDoc}
                            >
                                <Text>
                                    Archive Channel
                                </Text>
                            </Button>
                            <Button onPress={handleClose} variant="secondary">
                                <Text>
                                    Cancel
                                </Text>
                            </Button>
                        </View>
                    </BottomSheetView>
                )
            }}
        </Sheet>
    )
};