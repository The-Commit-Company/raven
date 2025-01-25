import { useCallback, useMemo } from 'react'
import { useFrappePostCall } from 'frappe-react-sdk'
import { View, Text, TouchableOpacity } from 'react-native'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import SmilePlus from "@assets/icons/SmileIcon.svg"
import { useColorScheme } from '@hooks/useColorScheme'
import EmojiPicker from '@components/common/EmojiPicker/EmojiPicker'
import { Image } from 'expo-image'

export interface ReactionObject {
    // The emoji
    reaction: string,
    // The users who reacted with this emoji
    users: string[],
    // The number of users who reacted with this emoji
    count: number,
    // Whether the emoji is a custom emoji
    is_custom?: boolean,
    // The name of the custom emoji
    emoji_name: string
}

interface MessageReactionsProps {
    messageID: string
    message_reactions: string | null | undefined
}
export default function MessageReactions({ messageID, message_reactions }: MessageReactionsProps) {

    const { myProfile: currentUser } = useCurrentRavenUser()

    const { call: reactToMessage } = useFrappePostCall('raven.api.reactions.react')

    const saveReaction = useCallback((emoji: string) => {
        if (messageID) {
            return reactToMessage({
                message_id: messageID,
                reaction: emoji,
            })
        }
    }, [messageID, reactToMessage])

    const reactions: ReactionObject[] = useMemo(() => {
        const parsed_json = JSON.parse(message_reactions ?? '{}') as Record<string, ReactionObject>

        return Object.entries(parsed_json).map(([key, value]) => ({
            ...value,
            emoji_name: key
        }))

    }, [message_reactions])

    if (reactions.length === 0) return null

    return (
        <View className='flex-row gap-1.5 flex-wrap items-center py-2'>
            {reactions.map((reaction: ReactionObject) => {
                return <ReactionButton key={reaction.emoji_name} reaction={reaction} currentUser={currentUser?.name} />
            })}

            <AddEmojiButton saveReaction={saveReaction} />
        </View>
    )
}

interface ReactionButtonProps {
    reaction: ReactionObject
    currentUser: string | undefined
}
const ReactionButton = ({ reaction, currentUser }: ReactionButtonProps) => {

    const viewReactionsRef = useSheetRef()

    const onLongPress = () => viewReactionsRef.current?.present()

    const { currentUserReacted } = useMemo(() => {
        return { currentUserReacted: reaction.users.includes(currentUser ?? "") }
    }, [currentUser, reaction])

    return (
        <View>
            <TouchableOpacity onLongPress={onLongPress} activeOpacity={0.7} className={`flex-row rounded-md py-1 px-2 gap-2 ${currentUserReacted ? 'bg-gray-200' : 'bg-gray-100'}`}>
                <Text className='text-xs'>{reaction.emoji_name}</Text>
                <Text className='text-xs font-bold text-gray-500'>{reaction.count}</Text>
            </TouchableOpacity>

            <Sheet enableDynamicSizing={false} ref={viewReactionsRef} snapPoints={["40%"]}>
                <BottomSheetView className='flex-1'>
                    <></>
                </BottomSheetView>
            </Sheet>
        </View>
    )
}

interface AddEmojiButtonProps {
    saveReaction: (emoji: string) => void
}
const AddEmojiButton = ({ saveReaction }: AddEmojiButtonProps) => {

    const { colors } = useColorScheme()

    const emojiPickerRef = useSheetRef()

    const openEmojiPicker = () => emojiPickerRef.current?.present()

    const onReact = (emoji: string) => {
        saveReaction(emoji)
        emojiPickerRef.current?.close({ duration: 450 })
    }

    return (
        <View>
            <TouchableOpacity onPress={openEmojiPicker} activeOpacity={0.7} className='flex-row bg-gray-100 rounded-md py-1 px-2.5 gap-2'>
                <SmilePlus width={16} height={16} fill={colors.icon} />
            </TouchableOpacity>

            <Sheet ref={emojiPickerRef} snapPoints={["65%"]}>
                <BottomSheetView className='flex-1'>
                    <EmojiPicker onReact={onReact} />
                </BottomSheetView>
            </Sheet>
        </View>
    )
}