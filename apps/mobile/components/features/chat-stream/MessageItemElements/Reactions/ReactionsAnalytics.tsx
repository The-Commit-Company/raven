import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Dimensions, Pressable, View } from 'react-native'
import { State, PanGestureHandler, ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated'
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
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

    const { colors } = useColorScheme()

    const [activeTab, setActiveTab] = useState(0);
    const tabIndicatorAnim = useSharedValue(0);
    const panRef = useRef(null);

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

    const handleSwipe = useCallback((event: any) => {
        const { translationX, state } = event.nativeEvent;

        if (state === State.END) {
            if (translationX > 50 && activeTab > 0) {
                // Swipe right
                runOnJS(setActiveTab)(prev => prev - 1);
            } else if (translationX < -50 && activeTab < tabs.length - 1) {
                // Swipe left
                runOnJS(setActiveTab)(prev => prev + 1);
            }
        }
    }, [activeTab, tabs.length]);

    const tabWidth = useMemo(() => width / Math.max(tabs.length, 1), [tabs.length]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: withSpring(tabIndicatorAnim.value * tabWidth, {
                        damping: 12,
                        stiffness: 80
                    }),
                },
            ],
        };
    });

    React.useEffect(() => {
        tabIndicatorAnim.value = activeTab;
    }, [activeTab]);

    return (
        <Sheet enableDynamicSizing={false} ref={reactionsSheetRef} snapPoints={["40%"]}>
            <BottomSheetView className='flex-1'>
                <View className="flex-row bg-white border-3">
                    {tabs.map((tab, index) => {
                        const source = useFileURL(tab.title)

                        if (tab.is_custom) {
                            return (
                                <Pressable key={tab.title} onPress={() => setActiveTab(index)} className='flex flex-1 flex-row justify-center items-center'>
                                    <Image source={source} style={{ width: 20, height: 20 }} />
                                </Pressable>
                            )
                        }

                        return (
                            <TouchableOpacity
                                key={tab.title}
                                style={{ width: tabWidth }}
                                className="items-center"
                                onPress={() => setActiveTab(index)}
                                activeOpacity={0.7}
                            >
                                <Text className='text-center text-lg py-1.5'>{tab.title}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                <View className='relative'>
                    <View className='h-[3px] bg-gray-100' />
                    <Animated.View
                        className="h-[3px] rounded-full opacity-80 absolute"
                        style={[{ width: tabWidth, backgroundColor: colors.primary }, animatedStyle]}
                    />
                </View>

                <PanGestureHandler
                    ref={panRef}
                    onGestureEvent={handleSwipe}
                    onHandlerStateChange={handleSwipe}
                >
                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                        <UserList
                            users={tabs[activeTab].users.map((user) => ({
                                user: user?.user,
                                reaction: user?.reaction,
                                is_custom: user?.is_custom,
                                emoji_name: user?.emoji_name
                            }))}
                        />
                    </ScrollView>
                </PanGestureHandler>
            </BottomSheetView>
        </Sheet>
    )
}

export default ReactionAnalytics;


interface UserItemProps {
    user: string;
    reaction?: string;
    is_custom?: boolean;
    emoji_name?: string;
}
const UserList = ({ users }: { users: UserItemProps[] }) => {

    return (
        <View>
            {users.map((user, index) => {
                return (
                    <View key={index}>
                        <UserItem
                            user={user.user}
                            reaction={user.reaction}
                            is_custom={user.is_custom}
                            emoji_name={user.emoji_name}
                        />
                        {users.length - 1 !== index ? <Divider /> : null}
                    </View>
                )
            })}
        </View>
    )
}

const UserItem = ({ user, reaction, is_custom, emoji_name }: UserItemProps) => {
    const userDetails = useGetUser(user)
    const userName = userDetails?.full_name ?? user

    const source = useFileURL(reaction)

    return (
        <View className='flex-row items-center justify-between p-3'>
            <View className='flex-row gap-3 items-center'>
                <UserAvatar
                    src={userDetails?.user_image ?? ""}
                    alt={userName}
                />
                <Text>{userName}</Text>
            </View>

            {!!is_custom ? (
                <Image source={source} alt={emoji_name} style={{ width: 20, height: 20 }} />
            ) : (
                <Text className='text-lg opacity-80'>
                    {reaction}
                </Text>
            )}
        </View>
    )
}