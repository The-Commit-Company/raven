import { Sheet } from "@components/nativewindui/Sheet";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { View } from "react-native";
import { Button } from "@components/nativewindui/Button";
import { Text } from "@components/nativewindui/Text";
import { ChannelListItem } from "@raven/types/common/ChannelListItem";
import { Checkbox } from "@components/nativewindui/Checkbox";
import { useContext, useState } from "react";
import { useFrappeDeleteDoc } from "frappe-react-sdk";
import { router } from "expo-router";
import { SiteContext } from "app/[site_id]/_layout";
import { toast } from "sonner-native";

interface DeleteChannelModalProps {
    deleteSheetRef: React.RefObject<BottomSheetModal>;
    channelData: ChannelListItem
}

export const DeleteChannelModal: React.FC<DeleteChannelModalProps> = ({
    deleteSheetRef,
    channelData
}) => {

    const { deleteDoc, error, loading: deletingDoc } = useFrappeDeleteDoc()

    const [allowDelete, setAllowDelete] = useState(false)

    const siteContext = useContext(SiteContext)
    const siteId = siteContext?.sitename

    const handleDeleteChannel = async () => {
        if (channelData?.name) {
            deleteDoc('Raven Channel', channelData.name)
                .then(() => {
                    // mutate(["channel_members", channelData.name], undefined, { revalidate: false })
                    handleClose()
                    router.replace(`/${siteId}/home`)
                    // if (lastWorkspace) {
                    //     navigate(`/${lastWorkspace}`)
                    // } else {
                    //     navigate('/')
                    // }

                    toast.success(`Channel ${channelData.channel_name} deleted.`)
                })
        }
    };

    const handleClose = () => {
        deleteSheetRef.current?.dismiss();
    };

    return (
        <Sheet ref={deleteSheetRef} snapPoints={[500]} >
            {props => {
                return (
                    <BottomSheetView
                        {...props}
                        className="gap-3"
                    >
                        <View className="flex-col gap-3 justify-start px-5 pt-5 pb-6">
                            <Text className="text-xl font-cal-sans">
                                Delete this Channel?
                            </Text>
                            <Text
                                className="text-sm"
                            >
                                Please understand that when you delete {channelData?.channel_name}:
                            </Text>
                            <View
                                className="gap-2 list-inside"
                            >
                                <Text
                                    className="text-sm"
                                >
                                    All messages, including files and images will be removed
                                </Text>
                                <Text
                                    className="text-sm"
                                >
                                    You can archive this channel instead to preserve your messages
                                </Text>
                            </View>
                            <View className="flex-row gap-2 align-center">
                                <Checkbox
                                    onCheckedChange={() => setAllowDelete(!allowDelete)}
                                    checked={allowDelete}
                                />
                                <Text className="text-base text-gray-800 dark:text-gray-200" >
                                    Yes, I understand, permanently delete this channel
                                </Text>
                            </View>
                        </View>
                        <View className="gap-3 justify-start px-5">
                            <Button
                                onPress={handleDeleteChannel}
                                disabled={!allowDelete || deletingDoc}
                            >
                                <Text>
                                    Delete Channel
                                </Text>
                            </Button>
                            <Button
                                onPress={handleClose}
                                variant="secondary"
                            >
                                <Text>
                                    Cancel
                                </Text>
                            </Button>
                        </View>
                    </BottomSheetView>
                )
            }}
        </Sheet>
    );
}