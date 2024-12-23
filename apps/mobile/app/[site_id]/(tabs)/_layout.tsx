import React from 'react';
import { Stack, Tabs } from 'expo-router';
import { SvgProps } from 'react-native-svg';
import HomeIcon from '@assets/icons/HomeIcon.svg';
import HomeOutlineIcon from '@assets/icons/HomeOutlineIcon.svg';
import ProfileIcon from '@assets/icons/ProfileIcon.svg';
import ProfileOutlineIcon from '@assets/icons/ProfileOutlineIcon.svg';
import ChatIcon from '@assets/icons/ChatIcon.svg';
import ChatOutlineIcon from '@assets/icons/ChatOutlineIcon.svg';
import BellIcon from '@assets/icons/BellIcon.svg';
import BellOutlineIcon from '@assets/icons/BellOutlineIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme'

export default function TabLayout() {

    const { colors, colorScheme } = useColorScheme()
    const dark = colorScheme == "dark"

    // Common styles
    const tabBarStyle = {
        backgroundColor: dark ? 'rgba(08, 08, 08, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderTopWidth: 1,
        borderTopColor: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)',
        paddingTop: 4,
        shadowColor: dark ? '#000' : '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 5
    }

    const headerStyle = {
        backgroundColor: dark ? 'rgba(08, 08, 08, 0)' : 'rgba(249, 249, 249, 1)',
        borderBottomWidth: 1,
        borderBottomColor: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0)',
    }

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
                        tabBarIcon: getTabBarIcon(HomeIcon, HomeOutlineIcon),
                    }}
                />
                <Tabs.Screen
                    name="direct-messages"
                    options={{
                        title: 'DMs',
                        headerShown: false,
                        headerStyle,
                        tabBarIcon: getTabBarIcon(ChatIcon, ChatOutlineIcon),
                    }}
                />
                <Tabs.Screen
                    name="activity"
                    options={{
                        title: 'Activity',
                        headerShown: false,
                        headerStyle,
                        tabBarIcon: getTabBarIcon(BellIcon, BellOutlineIcon),
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
