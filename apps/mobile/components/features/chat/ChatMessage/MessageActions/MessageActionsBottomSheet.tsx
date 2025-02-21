import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import MessageActions from './MessageActions';
import { Message } from '@raven/types/common/Message';
import { Sheet } from "@components/nativewindui/Sheet";
import { View } from "react-native";

interface MessageActionsBottomSheetProps {
    messageActionsSheetRef: React.RefObject<BottomSheetModal>
    message: Message
}

const MessageActionsBottomSheet: React.FC<MessageActionsBottomSheetProps> = ({ messageActionsSheetRef, message }) => {

    const handleClose = () => {
        messageActionsSheetRef.current?.dismiss()
    }

    return (
        <Sheet ref={messageActionsSheetRef}>
            <BottomSheetView>
                <View className="flex-col px-4 mt-2 mb-16">
                    <MessageActions message={message} onClose={handleClose} />
                </View>
            </BottomSheetView>
        </Sheet>
    )
}

export default MessageActionsBottomSheet