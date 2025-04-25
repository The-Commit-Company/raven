import React, { useMemo } from 'react';
import { Stack, Tabs } from 'expo-router';
import { SvgProps } from 'react-native-svg';
import HomeIcon from '@assets/icons/HomeIcon.svg';
import HomeOutlineIcon from '@assets/icons/HomeOutlineIcon.svg';
import ProfileIcon from '@assets/icons/ProfileIcon.svg';
import ProfileOutlineIcon from '@assets/icons/ProfileOutlineIcon.svg';
import ChatIcon from '@assets/icons/ChatIcon.svg';
import ChatOutlineIcon from '@assets/icons/ChatOutlineIcon.svg';
import ThreadsIcon from '@assets/icons/ThreadsIcon.svg';
import ThreadsOutlineIcon from '@assets/icons/ThreadsOutlineIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme'
import { Platform } from 'react-native';
import useUnreadThreadsCount from '@hooks/useUnreadThreadsCount';
import useUnreadMessageCount from '@hooks/useUnreadMessageCount';

const tabBarBadgeStyle = {
    maxWidth: 8,
    maxHeight: 8,
    marginRight: 4,
    marginTop: 2,
    fontSize: 8,
    lineHeight: 9,
    alignSelf: undefined,
}

export default function TabLayout() {

    const { colors, colorScheme } = useColorScheme()
    const dark = colorScheme == "dark"

    // Common styles
    const tabBarStyle = {
        backgroundColor: dark ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderTopWidth: 1,
        borderTopColor: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)',
        paddingTop: 4,
        marginBottom: Platform.OS === 'ios' ? 0 : 8,
        shadowColor: '#000',
        shadowOffset: Platform.OS === 'ios' ? { width: 0, height: -2 } : undefined,
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: Platform.OS === 'ios' ? 5 : 0
    }

    const headerStyle = {
        backgroundColor: dark ? 'rgba(18, 18, 18, 0)' : 'rgba(249, 249, 249, 1)',
        borderBottomWidth: 1,
        borderBottomColor: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0)',
    }

    const { data: unreadThreads } = useUnreadThreadsCount()

    const { unread_count } = useUnreadMessageCount()

    const { hasUnreadMessages, hasUnreadDMs } = useMemo(() => {
        return {
            hasUnreadMessages: unread_count?.message.some(item => item.unread_count > 0),
            hasUnreadDMs: unread_count?.message.some(item => item.unread_count > 0 && item.is_direct_message === 1),
        }
    }, [unread_count])

    const hasUnreadThreads = useMemo(() => {
        return unreadThreads?.message.some(item => item.unread_count > 0)
    }, [unreadThreads])

    const tabBarIconStyle = (focused: boolean) => ({
        opacity: focused ? 1 : dark ? 0.8 : 0.7,
    })

    const getTabBarIcon =
        (FilledIcon: React.FC<SvgProps>, OutlineIcon: React.FC<SvgProps>) =>
            ({ color, focused }: { color: string; focused: boolean }) =>
                focused ? (
                    <FilledIcon
                        fill={color}
                        style={tabBarIconStyle(focused)}
                        width={24}
                        height={24}
                    />
                ) : (
                    <OutlineIcon
                        fill={color}
                        style={tabBarIconStyle(focused)}
                        width={24}
                        height={24}
                    />
                )

    return (
        <>
            <Stack.Screen options={{ headerShown: false, title: 'Home' }} />
            <Tabs
                screenOptions={{
                    tabBarStyle,
                    tabBarActiveTintColor: dark ? '#FFFFFF' : colors.primary,
                    tabBarInactiveTintColor: dark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: 'Home',
                        headerShown: false,
                        headerStyle,
                        tabBarBadge: hasUnreadMessages ? '' : undefined,
                        tabBarBadgeStyle,
                        tabBarIcon: getTabBarIcon(HomeIcon, HomeOutlineIcon),
                    }}
                />
                <Tabs.Screen
                    name="direct-messages"
                    options={{
                        title: 'DMs',
                        headerShown: false,
                        headerStyle,
                        tabBarBadge: hasUnreadDMs ? '' : undefined,
                        tabBarBadgeStyle,
                        tabBarIcon: getTabBarIcon(ChatIcon, ChatOutlineIcon),
                    }}
                />
                <Tabs.Screen
                    name="threads"
                    options={{
                        title: 'Threads',
                        headerShown: false,
                        headerStyle,
                        tabBarBadge: hasUnreadThreads ? '' : undefined,
                        tabBarBadgeStyle,
                        tabBarIcon: getTabBarIcon(ThreadsIcon, ThreadsOutlineIcon),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        headerShown: false,
                        headerStyle,
                        tabBarIcon: getTabBarIcon(ProfileIcon, ProfileOutlineIcon),
                    }}
                />
            </Tabs>
        </>
    )
}