import { useContext } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import SmilePlus from "@assets/icons/SmilePlus.svg"
import { Text } from '@components/nativewindui/Text'
import { Message } from '@raven/types/common/Message'
import { useColorScheme } from '@hooks/useColorScheme'
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import EmojiPicker from '@components/common/EmojiPicker/EmojiPicker'
import { toast } from 'sonner-native'

const QUICK_EMOJIS = ['👍', '✅', '👀', '🎉', '❤️']

interface MessageReactionsProps {
    message: Message | null
    onClose: () => void
}

const QuickReactions = ({ message, onClose }: MessageReactionsProps) => {

    const { colors } = useColorScheme()
    const { call } = useContext(FrappeContext) as FrappeConfig
    const emojiBottomSheetRef = useSheetRef()

    const onReact = (emoji: string) => {
        call.post('raven.api.reactions.react', {
            message_id: message?.name,
            reaction: emoji
        }).then(() => {
            emojiBottomSheetRef.current?.close({ duration: 450 })
            onClose();
        }).catch(() => {
            toast.error("Could not react to message.")
        })
    }

    return (
        <>
            <View className="flex flex-row justify-between">
                {QUICK_EMOJIS.map((reaction) => (
                    <TouchableOpacity
                        key={reaction}
                        onPress={() => onReact(reaction)}
                        className='p-3 bg-card rounded-full'
                        activeOpacity={0.6}>
                        <Text>{reaction}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    className='p-3 bg-card rounded-full'
                    activeOpacity={0.6}
                    onPress={() => emojiBottomSheetRef.current?.present()}>
                    <SmilePlus width={24} height={24} color={colors.icon} />
                </TouchableOpacity>
            </View>

            <Sheet enableDynamicSizing={false} ref={emojiBottomSheetRef} snapPoints={["50"]}>
                <BottomSheetView className='flex-1'>
                    <EmojiPicker onReact={onReact} />
                </BottomSheetView>
            </Sheet>
        </>
    )
}

export default QuickReactions