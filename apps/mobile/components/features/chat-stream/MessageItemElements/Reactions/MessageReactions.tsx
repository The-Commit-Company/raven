import { useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useFrappePostCall } from 'frappe-react-sdk'
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

    const saveReaction = useCallback((emoji: string, is_custom: boolean, emoji_name?: string) => {
        if (messageID) {
            return reactToMessage({
                message_id: messageID,
                reaction: emoji,
                is_custom,
                emoji_name
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

    const reactionsSheetRef = useSheetRef()

    const openReactions = () => {
        impactAsync(ImpactFeedbackStyle.Light)
        reactionsSheetRef.current?.present()
    }

    if (reactions.length === 0) return null

    return (
        <>
            <View className='flex-row gap-x-1.5 gap-y-1 flex-wrap items-center py-2'>
                {reactions.map((reaction: ReactionObject) => {
                    return <ReactionButton
                        key={reaction.emoji_name}
                        viewAnalytics={openReactions}
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
    saveReaction: (emoji: string, is_custom: boolean, emoji_name?: string) => void
    viewAnalytics: () => void
}
const ReactionButton = ({ reaction, currentUser, saveReaction, viewAnalytics }: ReactionButtonProps) => {

    const { currentUserReacted } = useMemo(() => {
        return { currentUserReacted: reaction.users.includes(currentUser ?? "") }
    }, [currentUser, reaction])

    const onReact = useCallback(() => {
        saveReaction(reaction.reaction, reaction?.is_custom ?? false, reaction.emoji_name)
    }, [saveReaction, reaction])

    return (
        <TouchableOpacity
            onLongPress={viewAnalytics}
            onPress={onReact}
            activeOpacity={0.7}
            className={clsx(`flex-row rounded-md py-1 px-2 gap-2 border-[0.5px]`,
                currentUserReacted ? "bg-blue-50/80 border-blue-600 dark:border-muted-foreground/40 dark:bg-muted" : "bg-card dark:bg-muted/50 border-muted/50")}
        >
            {reaction.is_custom ? (
                <CustomEmojiView emoji={reaction.reaction} />
            ) : (
                <Text className='text-xs'>{reaction.reaction}</Text>
            )}
            <Text className={clsx('text-xs font-bold', currentUserReacted ? "text-foreground dark:text-foreground" : "text-foreground")}>{reaction.count}</Text>
        </TouchableOpacity>

    )
}

const CustomEmojiView = ({ emoji }: { emoji: string }) => {
    const source = useFileURL(emoji)

    return <Image source={source} style={{ width: 18, height: 18 }} contentFit='scale-down' contentPosition={'center'} />
}

interface AddEmojiButtonProps {
    saveReaction: (emoji: string, is_custom: boolean, emoji_name?: string) => void,
}
const AddEmojiButton = ({ saveReaction }: AddEmojiButtonProps) => {

    const { colors } = useColorScheme()

    const emojiPickerRef = useSheetRef()

    const openEmojiPicker = () => emojiPickerRef.current?.present()

    const onReact = (emoji: string) => {
        saveReaction(emoji, false)
        emojiPickerRef.current?.close({ duration: 450 })
    }

    return (
        <View>
            <TouchableOpacity onPress={openEmojiPicker} activeOpacity={0.7} className='flex-row items-center bg-card border-card dark:border-muted/50 dark:bg-muted/50 border-[0.5px] rounded-md py-1 px-3 min-w-[4ch]'>
                <SmilePlus width={16} height={16} color={colors.icon} />
            </TouchableOpacity>

            <Sheet ref={emojiPickerRef} snapPoints={["65%"]}>
                <BottomSheetView className='flex-1'>
                    <EmojiPicker onReact={onReact} />
                </BottomSheetView>
            </Sheet>
        </View>
    )
}
