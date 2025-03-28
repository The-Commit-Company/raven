import { TouchableOpacity, View } from 'react-native'
import SmilePlus from "@assets/icons/SmilePlus.svg"
import { Text } from '@components/nativewindui/Text'
import { Message } from '@raven/types/common/Message'
import { useColorScheme } from '@hooks/useColorScheme'
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import EmojiPicker from '@components/common/EmojiPicker/EmojiPicker'
import { toast } from 'sonner-native'
import useReactToMessage from '@raven/lib/hooks/useReactToMessage'
import { Emoji } from '@components/common/EmojiPicker/Picker'

interface MessageReactionsProps {
    message: Message | null
    onClose: () => void
    quickReactionEmojis: string[]
}

const QuickReactions = ({ message, onClose, quickReactionEmojis }: MessageReactionsProps) => {

    const { colors } = useColorScheme()
    const emojiBottomSheetRef = useSheetRef()

    const saveReaction = useReactToMessage()

    const onReactNatively = (emoji: string) => {
        if (message) {
            saveReaction(message, emoji).then(() => {
                emojiBottomSheetRef.current?.close({ duration: 450 })
                onClose();
            }).catch(() => {
                toast.error("Could not react to message.")
            })
        }
    }

    const onReactEmoji = (emoji: Emoji) => {

        if (message) {
            if (emoji.native) {
                saveReaction(message, emoji.native)
                    .then(() => {
                        emojiBottomSheetRef.current?.close({ duration: 450 })
                        onClose();
                    }).catch(() => {
                        toast.error("Could not react to message.")
                    })
            } else {
                saveReaction(message, emoji?.src ?? "", true, emoji.id)
                    .then(() => {
                        emojiBottomSheetRef.current?.close({ duration: 450 })
                        onClose();
                    }).catch(() => {
                        toast.error("Could not react to message.")
                    })
            }
        }

    }

    return (
        <>
            <View className="flex flex-row justify-between">
                {quickReactionEmojis.map((reaction) => (
                    <TouchableOpacity
                        key={reaction}
                        hitSlop={10}
                        onPress={() => onReactNatively(reaction)}
                        className='p-3 bg-card rounded-full'
                        activeOpacity={0.6}>
                        <Text>{reaction}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    className='p-3 bg-card rounded-full'
                    activeOpacity={0.6}
                    onPress={() => emojiBottomSheetRef.current?.present()}
                >
                    <SmilePlus width={24} height={24} color={colors.icon} />
                </TouchableOpacity>
            </View>

            <Sheet ref={emojiBottomSheetRef} enableDynamicSizing={false} snapPoints={["65"]}>
                <BottomSheetView className='flex-1'>
                    <EmojiPicker onReact={onReactEmoji} />
                </BottomSheetView>
            </Sheet>
        </>
    )
}

export default QuickReactions