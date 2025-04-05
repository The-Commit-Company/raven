import { useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import SmilePlus from "@assets/icons/SmilePlus.svg"
import { useColorScheme } from '@hooks/useColorScheme'
import EmojiPicker from '@components/common/EmojiPicker/EmojiPicker'
import ReactionAnalytics from './ReactionsAnalytics'
import useFileURL from '@hooks/useFileURL'
import { Image } from 'expo-image'
import clsx from 'clsx'
import { ImpactFeedbackStyle } from 'expo-haptics'
import { impactAsync } from 'expo-haptics'
import useReactToMessage from '@raven/lib/hooks/useReactToMessage'
import { Message } from '@raven/types/common/Message'
import { Gesture, GestureDetector, LongPressGesture } from 'react-native-gesture-handler'
import { runOnJS } from 'react-native-reanimated'
import { Emoji } from '@components/common/EmojiPicker/Picker'

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
    message: Message,
    longPressGesture: LongPressGesture
}
export default function MessageReactions({ message, longPressGesture }: MessageReactionsProps) {

    const message_reactions = message.message_reactions

    const { myProfile: currentUser } = useCurrentRavenUser()

    const reactToMessage = useReactToMessage()

    const saveReaction = useCallback((emoji: string, is_custom: boolean, emoji_name?: string) => {
        if (message) {
            return reactToMessage(message, emoji, is_custom, emoji_name)
        }
    }, [message, reactToMessage])

    const reactions: ReactionObject[] = useMemo(() => {
        const parsed_json = JSON.parse(message_reactions ?? '{}') as Record<string, ReactionObject>
        return Object.entries(parsed_json).map(([key, value]) => ({
            ...value,
            emoji_name: key
        }))

    }, [message_reactions])

    const reactionsSheetRef = useSheetRef()

    const openReactions = () => {
        impactAsync(ImpactFeedbackStyle.Light)
        reactionsSheetRef.current?.present()
    }

    if (reactions.length === 0) return null

    return (
        <>
            <View className='flex-row gap-x-1.5 gap-y-1 flex-wrap items-center pb-0.5 pt-1.5'>
                {reactions.map((reaction: ReactionObject) => {
                    return <ReactionButton
                        key={reaction.emoji_name}
                        onLongPress={openReactions}
                        longPressGesture={longPressGesture}
                        reaction={reaction}
                        currentUser={currentUser?.name}
                        saveReaction={saveReaction} />
                })}

                <AddEmojiButton saveReaction={saveReaction} />
            </View>

            <ReactionAnalytics reactionsSheetRef={reactionsSheetRef} reactions={reactions} />
        </>
    )
}

interface ReactionButtonProps {
    reaction: ReactionObject
    currentUser: string | undefined
    saveReaction: (emoji: string, is_custom: boolean, emoji_name?: string) => void,
    onLongPress: () => void,
    longPressGesture: LongPressGesture
}
const ReactionButton = ({ reaction, currentUser, saveReaction, onLongPress, longPressGesture }: ReactionButtonProps) => {

    const { currentUserReacted } = useMemo(() => {
        return { currentUserReacted: reaction.users.includes(currentUser ?? "") }
    }, [currentUser, reaction])

    const onReact = useCallback(() => {
        impactAsync(ImpactFeedbackStyle.Light)
        saveReaction(reaction.reaction, reaction?.is_custom ?? false, reaction.emoji_name)
    }, [saveReaction, reaction])

    /** Route to file viewer on single tap - but wait for double tap to fail */
    const reactionLongPressGesture = useMemo(() => {
        return Gesture.LongPress()
            .hitSlop(10)
            .minDuration(250)
            .onStart(() => {
                runOnJS(onLongPress)()
            }).blocksExternalGesture(longPressGesture)
    }, [onLongPress, longPressGesture])

    return (
        <GestureDetector gesture={reactionLongPressGesture}>
            <TouchableOpacity
                onPress={onReact}
                activeOpacity={0.7}
                className={clsx(`flex-row rounded-xl py-1 px-2 gap-2 border`,
                    currentUserReacted ? "bg-blue-50/80 border-blue-600 dark:border-muted-foreground/40 dark:bg-muted" : "bg-card dark:bg-muted/50 border-muted/50")}
            >
                {reaction.is_custom ? (
                    <CustomEmojiView emoji_src={reaction.reaction} />
                ) : (
                    <Text className='text-sm'>{reaction.reaction}</Text>
                )}
                <Text className={clsx('text-sm font-bold', currentUserReacted ? "text-foreground dark:text-foreground" : "text-foreground")}>{reaction.count}</Text>
            </TouchableOpacity>
        </GestureDetector>

    )
}

const CustomEmojiView = ({ emoji_src }: { emoji_src: string }) => {
    const source = useFileURL(emoji_src ?? "")

    return <Image transition={100} source={source} style={{ width: 20, height: 20, borderRadius: 2 }} contentFit='scale-down' contentPosition={'center'} />
}

interface AddEmojiButtonProps {
    saveReaction: (emoji: string, is_custom: boolean, emoji_name?: string) => void,
}
const AddEmojiButton = ({ saveReaction }: AddEmojiButtonProps) => {

    const { colors } = useColorScheme()

    const emojiPickerRef = useSheetRef()

    const openEmojiPicker = () => emojiPickerRef.current?.present()

    const onReact = (emoji: Emoji) => {

        if (emoji.native) {
            saveReaction(emoji.native, false)
        } else {
            saveReaction(emoji?.src ?? "", true, emoji.id)
        }

        emojiPickerRef.current?.close({ duration: 450 })
    }

    return (
        <View>
            <TouchableOpacity onPress={openEmojiPicker} activeOpacity={0.7} className='flex-row items-center bg-card border-card dark:border-muted/50 dark:bg-muted/50 border rounded-xl py-1 px-3 min-w-[5ch]'>
                <SmilePlus width={20} height={20} color={colors.icon} />
            </TouchableOpacity>

            <Sheet ref={emojiPickerRef} enableDynamicSizing={false} snapPoints={["65"]}>
                <BottomSheetView className='flex-1'>
                    <EmojiPicker onReact={onReact} />
                </BottomSheetView>
            </Sheet>
        </View>
    )
}
