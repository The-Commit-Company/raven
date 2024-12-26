import { useContext } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { Pressable, ScrollView } from 'react-native'
import SmileIcon from "@assets/icons/SmileIcon.svg"
import { Text } from '@components/nativewindui/Text'
import { Message } from '@raven/types/common/Message'
import { COLORS } from '@theme/colors'
import { useColorScheme } from '@hooks/useColorScheme'
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import EmojiPicker from '@components/common/EmojiPicker/EmojiPicker'

const QUICK_EMOJIS = ['👍', '✅', '👀', '🎉', '❤️', '👋']

interface MessageReactionsProps {
    message: Message | null
    onClose: () => void
}
const QuickReactions = ({ message, onClose }: MessageReactionsProps) => {

    const { colors } = useColorScheme()

    const { call } = useContext(FrappeContext) as FrappeConfig

    const emojiBottomSheetRef = useSheetRef();

    const onReact = (emoji: string) => {
        call.post('raven.api.reactions.react', {
            message_id: message?.name,
            reaction: emoji
        }).then(() => {
            emojiBottomSheetRef.current?.close()
            onClose();
        }).catch(() => {
            // toast.error("Could not react to message.")
        })
    }

    return (
        <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex flex-row gap-3">
                    {QUICK_EMOJIS.map((reaction) => (
                        <TouchableOpacity
                            key={reaction}
                            onPress={() => onReact(reaction)}
                            className='p-3 bg-gray-100 dark:bg-gray-800 rounded-full'
                            activeOpacity={0.6}
                        >
                            <Text className=''>{reaction}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        className='p-3 bg-gray-100 dark:bg-gray-800 rounded-full'
                        activeOpacity={0.6}
                        onPress={() => emojiBottomSheetRef.current?.present()}
                    >
                        <SmileIcon fill={colors.icon} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Sheet enableDynamicSizing={false} ref={emojiBottomSheetRef} snapPoints={["85"]}>
                <BottomSheetView className='flex-1'>
                    <EmojiPicker onReact={onReact} />
                </BottomSheetView>
            </Sheet>
        </>
    )
}

export default QuickReactions