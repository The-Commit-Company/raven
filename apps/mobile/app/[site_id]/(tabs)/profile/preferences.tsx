import { Stack } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Form, FormItem, FormSection } from '@components/nativewindui/Form';
import { Text } from '@components/nativewindui/Text';
import { useColorScheme } from '@hooks/useColorScheme';
import HeaderBackButton from '@components/common/Buttons/HeaderBackButton';
import { useAtom } from 'jotai';
import { doubleTapMessageEmojiAtom, quickReactionEmojisAtom } from '@lib/preferences';
import { Pressable, View } from 'react-native';
import EmojiPicker from '@components/common/EmojiPicker/EmojiPicker';
import { useState } from 'react';
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Emoji } from '@components/common/EmojiPicker/Picker';
import CommonErrorBoundary from '@components/common/CommonErrorBoundary';

const REACTION_PRESSABLE_STYLES = 'w-12 h-12 flex items-center justify-center p-2 bg-card dark:bg-card rounded-full active:bg-muted/20'

export default function PreferencesScreen() {

    const insets = useSafeAreaInsets()

    const { colors } = useColorScheme()

    const [quickReactionEmojis, setQuickReactionEmojis] = useAtom(quickReactionEmojisAtom)

    const [doubleTapMessageEmoji, setDoubleTapMessageEmoji] = useAtom(doubleTapMessageEmojiAtom)

    const emojiBottomSheetRef = useSheetRef()

    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<false | 'doubleTapMessageEmoji' | 'quickReactionEmojis-1' | 'quickReactionEmojis-2' | 'quickReactionEmojis-3' | 'quickReactionEmojis-4' | 'quickReactionEmojis-5'>(false)


    const onEmojiSelect = (emoji: Emoji) => {
        if (isEmojiPickerOpen === 'doubleTapMessageEmoji') {
            setDoubleTapMessageEmoji(emoji.native)
        } else if (isEmojiPickerOpen && isEmojiPickerOpen.includes('quickReactionEmojis')) {
            const index = parseInt(isEmojiPickerOpen.split('-')[1]) - 1
            const newEmojis = [...quickReactionEmojis]
            newEmojis[index] = emoji.native
            setQuickReactionEmojis(newEmojis)
        }

        setIsEmojiPickerOpen(false)
        emojiBottomSheetRef.current?.dismiss()
    }

    const openEmojiPicker = (type: 'doubleTapMessageEmoji' | 'quickReactionEmojis-1' | 'quickReactionEmojis-2' | 'quickReactionEmojis-3' | 'quickReactionEmojis-4' | 'quickReactionEmojis-5') => {
        setIsEmojiPickerOpen(type)
        emojiBottomSheetRef.current?.present()
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerLeft() {
                        return (
                            <HeaderBackButton />
                        )
                    },
                    headerTitle: () => <Text className='ml-2 text-base font-semibold'>Preferences</Text>,
                    headerStyle: { backgroundColor: colors.background },
                }} />
            <KeyboardAwareScrollView
                bottomOffset={8}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom: insets.bottom }}>
                <Form className="gap-5 px-4 pt-8">
                    <FormSection footnote="Set your preferred emoji for reactions on double tap.">
                        <FormItem className='py-0.5'>
                            <Pressable onPress={() => openEmojiPicker('doubleTapMessageEmoji')}
                                hitSlop={10}
                                className='bg-card dark:bg-card rounded-xl active:bg-muted/20'>
                                <View className='flex flex-row py-2.5 px-4 justify-between'>
                                    <View className='flex-row items-center gap-2'>
                                        <Text className='text-base'>React on Double Tap with</Text>
                                    </View>
                                    <View>
                                        <Text className='text-base text-muted-foreground/80'>{doubleTapMessageEmoji}</Text>
                                    </View>
                                </View>
                            </Pressable>
                        </FormItem>
                    </FormSection>

                    <FormSection footnote="Tap an emoji to set it as your preferred reaction.">
                        <FormItem className='py-0.5'>
                            <View className='flex flex-col gap-2 px-2'>
                                <Text className='text-base font-medium'>Preferred Emojis for Reactions</Text>
                                <View className='flex flex-row gap-2 justify-around'>
                                    <Pressable
                                        onPress={() => openEmojiPicker('quickReactionEmojis-1')}
                                        hitSlop={10}
                                        className={REACTION_PRESSABLE_STYLES}>
                                        <Text className='text-xl'>{quickReactionEmojis[0]}</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={() => openEmojiPicker('quickReactionEmojis-2')}
                                        hitSlop={10}
                                        className={REACTION_PRESSABLE_STYLES}>
                                        <Text className='text-xl'>{quickReactionEmojis[1]}</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={() => openEmojiPicker('quickReactionEmojis-3')}
                                        hitSlop={10}
                                        className={REACTION_PRESSABLE_STYLES}>
                                        <Text className='text-xl'>{quickReactionEmojis[2]}</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={() => openEmojiPicker('quickReactionEmojis-4')}
                                        hitSlop={10}
                                        className={REACTION_PRESSABLE_STYLES}>
                                        <Text className='text-xl'>{quickReactionEmojis[3]}</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={() => openEmojiPicker('quickReactionEmojis-5')}
                                        hitSlop={10}
                                        className={REACTION_PRESSABLE_STYLES}>
                                        <Text className='text-xl'>{quickReactionEmojis[4]}</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </FormItem>
                    </FormSection>
                </Form>
                <Sheet enableDynamicSizing={false} ref={emojiBottomSheetRef} snapPoints={["80"]}>
                    <BottomSheetView className='flex-1'>
                        <EmojiPicker allowCustomEmojis={false} onReact={onEmojiSelect} />
                    </BottomSheetView>
                </Sheet>
            </KeyboardAwareScrollView>
        </>
    )
}

export const ErrorBoundary = CommonErrorBoundary
