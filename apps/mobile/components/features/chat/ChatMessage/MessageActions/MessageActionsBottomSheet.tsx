import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import MessageActions from './MessageActions';
import { Message } from '@raven/types/common/Message';
import { Sheet } from "@components/nativewindui/Sheet";
import { View } from "react-native";
import { useAtomValue } from "jotai";
import { quickReactionEmojisAtom } from "@lib/preferences";

interface MessageActionsBottomSheetProps {
    messageActionsSheetRef: React.RefObject<BottomSheetModal>
    message: Message | null
    handleClose: () => void,
    isThread?: boolean
}

const MessageActionsBottomSheet: React.FC<MessageActionsBottomSheetProps> = ({ messageActionsSheetRef, message, handleClose, isThread = false }) => {

    // Loading this here since the app crashes if it's loaded inside the sheet
    // App crash message: "Handler for tag <number> does not exist"
    const quickReactionEmojis = useAtomValue(quickReactionEmojisAtom)

    return (
        <Sheet ref={messageActionsSheetRef} snapPoints={['60%']} onDismiss={handleClose}>
            <BottomSheetView>
                <View className="flex-col px-4 mt-2 pb-16">
                    {message && <MessageActions
                        message={message}
                        quickReactionEmojis={quickReactionEmojis}
                        onClose={handleClose}
                        isThread={isThread} />}
                </View>
            </BottomSheetView>
        </Sheet>
    )
}

export default MessageActionsBottomSheet