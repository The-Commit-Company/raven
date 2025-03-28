import React, { useCallback, useMemo, useState } from 'react'
import { Dimensions, Pressable, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, useAnimatedReaction } from 'react-native-reanimated'
import { BottomSheetFlashList, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { Text } from '@components/nativewindui/Text'
import { useColorScheme } from '@hooks/useColorScheme'
import UserAvatar from '@components/layout/UserAvatar'
import { useGetUser } from '@raven/lib/hooks/useGetUser'
import { Divider } from '@components/layout/Divider'
import { Sheet } from '@components/nativewindui/Sheet'
import { ReactionObject } from './MessageReactions'
import useFileURL from '@hooks/useFileURL'
import { Image } from 'expo-image'

const { width } = Dimensions.get('window');

interface ReactionAnalyticsProps {
    reactions: ReactionObject[]
    reactionsSheetRef: React.RefObject<BottomSheetModal>;
}
const ReactionAnalytics = ({ reactions, reactionsSheetRef }: ReactionAnalyticsProps) => {



    return (
        <Sheet enableDynamicSizing={false} ref={reactionsSheetRef} snapPoints={["60%", "90%"]}>
            <ReactionAnalyticsContent reactions={reactions} />
        </Sheet>
    )
}

export default ReactionAnalytics;

const ReactionAnalyticsContent = ({ reactions }: { reactions: ReactionObject[] }) => {

    const { colors } = useColorScheme()

    const activeTabShared = useSharedValue(0);
    const tabIndicatorAnim = useSharedValue(0);

    const all_reacted_members = useMemo(() => {
        return reactions.flatMap(({ reaction, users, is_custom, emoji_name }: ReactionObject) =>
            users.map((user: string) => ({ user, reaction, is_custom, emoji_name }))
        );
    }, [reactions]);

    const tabs = useMemo(() => {
        const reactionTabs = reactions.map((r) => {

            return {
                title: r.reaction,
                is_custom: r.is_custom,
                users: r.users.map((user: string) => ({
                    user,
                    reaction: r.reaction,
                    is_custom: r.is_custom,
                    emoji_name: r.emoji_name
                }))
            }
        });
        return [{ title: "All", is_custom: false, users: all_reacted_members }, ...reactionTabs];
    }, [reactions, all_reacted_members]);

    const handleTabPress = useCallback((index: number) => {
        activeTabShared.value = index;
    }, []);

    const tabWidth = useMemo(() => width / Math.max(tabs.length, 1), [tabs.length]);

    useAnimatedReaction(() => activeTabShared.value, (currentValue) => {
        tabIndicatorAnim.value = withSpring(currentValue, {
            damping: 12,
            stiffness: 80
        });
    }, [tabWidth]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: tabIndicatorAnim.value * tabWidth,
                },
            ],
        };
    });

    const [currentTabIndex, setCurrentTabIndex] = useState(0);

    useAnimatedReaction(() => Math.round(activeTabShared.value), (currentValue) => {
        runOnJS(setCurrentTabIndex)(currentValue);
    }, [tabWidth]);

    const xSwipeGesture = Gesture.Pan()
        .activeOffsetX([-20, 20]) // Start capturing after 20px movement
        .onEnd((event) => {
            'worklet';
            const translation = event.translationX;

            if (translation > 50 && activeTabShared.value > 0) {
                // Swipe right - previous tab
                activeTabShared.value = activeTabShared.value - 1;
            } else if (translation < -50 && activeTabShared.value < tabs.length - 1) {
                // Swipe left - next tab
                activeTabShared.value = activeTabShared.value + 1;
            }
        });


    return <BottomSheetView className='flex-1 pb-4'>
        <View className="flex-row border-3">
            {tabs.map((tab, index) => {
                return (
                    <Pressable
                        key={tab.title}
                        style={{ width: tabWidth }}
                        className="justify-center flex-1 items-center"
                        onPress={() => handleTabPress(index)}
                        hitSlop={10}
                    >
                        {tab.is_custom ?
                            <CustomEmojiView emoji={tab.title} width={20} height={20} emojiName={tab.title} /> :
                            <Text className='text-center text-lg py-1.5'>{tab.title}</Text>
                        }
                    </Pressable>
                )
            })}
        </View>

        <View className='relative'>
            <View className='h-[2px] bg-gray-100 dark:bg-gray-800' />
            <Animated.View
                className="h-[2px] rounded-full opacity-80 absolute"
                style={[{ width: tabWidth, backgroundColor: colors.primary }, animatedStyle]}
            />
        </View>

        <GestureDetector gesture={xSwipeGesture}>
            <Animated.View className="flex-1">
                <UserList
                    users={tabs[currentTabIndex].users.map((user) => ({
                        user: user?.user,
                        reaction: user?.reaction,
                        is_custom: user?.is_custom,
                        emoji_name: user?.emoji_name
                    }))}
                />
            </Animated.View>
        </GestureDetector>
    </BottomSheetView>
}


interface UserItemProps {
    user: string;
    reaction?: string;
    is_custom?: boolean;
    emoji_name?: string;
}
const UserList = ({ users }: { users: UserItemProps[] }) => {
    const renderItem = ({ item, index }: { item: UserItemProps; index: number }) => (
        <View>
            <UserItem
                user={item.user}
                reaction={item.reaction}
                is_custom={item.is_custom}
                emoji_name={item.emoji_name}
            />
            {index !== users.length - 1 && <Divider />}
        </View>
    );

    return (
        <BottomSheetFlashList
            data={users}
            renderItem={renderItem}
            estimatedItemSize={57}
            keyExtractor={keyExtractor}
        />
    );
};

const keyExtractor = (item: UserItemProps, index: number) => `${item.user}-${index}`;

const UserItem = ({ user, reaction, is_custom, emoji_name }: UserItemProps) => {
    const userDetails = useGetUser(user)
    const userName = userDetails?.full_name ?? user

    return (
        <View className='flex-row items-center justify-between p-3'>
            <View className='flex-row gap-3 items-center'>
                <UserAvatar
                    src={userDetails?.user_image ?? ""}
                    alt={userName}
                    avatarProps={{
                        className: 'w-8 h-8'
                    }}
                />
                <Text className='text-base'>{userName}</Text>
            </View>

            {is_custom && reaction ? (
                <CustomEmojiView emoji={reaction} width={20} height={20} emojiName={emoji_name} />
            ) : (
                <Text className='text-lg opacity-80'>
                    {reaction}
                </Text>
            )}
        </View>
    )
}

const CustomEmojiView = ({ emoji, width = 18, height = 18, emojiName }: { emoji: string, width?: number, height?: number, emojiName?: string }) => {
    const source = useFileURL(emoji)

    return <Image source={source} style={{ width, height }} alt={emojiName ?? emoji} contentFit='scale-down' contentPosition={'center'} />
}