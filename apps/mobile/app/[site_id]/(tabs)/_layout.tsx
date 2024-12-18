import React from 'react';
import { Tabs } from 'expo-router';
import { SvgProps } from 'react-native-svg';
import HomeIcon from '@assets/icons/HomeIcon.svg';
import ProfileIcon from '@assets/icons/ProfileIcon.svg';
import ChatIcon from '@assets/icons/ChatIcon.svg';
import BellIcon from '@assets/icons/BellIcon.svg';
import { useColorScheme } from '@lib/useColorScheme'

export default function TabLayout() {

    const { colors, colorScheme } = useColorScheme()
    const dark = colorScheme == "dark"

    // Common styles
    const tabBarStyle = {
        backgroundColor: dark ? 'rgba(12, 10, 21, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderTopWidth: 1,
        borderTopColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        paddingTop: 4,
    }

    const headerStyle = {
        backgroundColor: dark ? 'rgba(12, 10, 21, 0)' : 'rgba(249, 249, 249, 1)',
        borderBottomWidth: 1,
        borderBottomColor: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0)',
    }

    const tabBarIconStyle = (focused: boolean) => ({
        opacity: focused ? 1 : dark ? 0.8 : 0.7,
    })

    const getTabBarIcon =
        (IconComponent: React.FC<SvgProps>) =>
            ({ color, focused }: { color: string; focused: boolean }) =>
            (
                <IconComponent
                    fill={color}
                    style={tabBarIconStyle(focused)}
                    width={24}
                    height={24}
                />
            )

    return (
        <Tabs
            screenOptions={{
                tabBarStyle,
                tabBarActiveTintColor: dark ? '#FFFFFF' : colors.primary,
                tabBarInactiveTintColor: dark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    headerShown: false,
                    headerStyle,
                    tabBarIcon: getTabBarIcon(HomeIcon),
                }}
            />
            <Tabs.Screen
                name="direct-messages"
                options={{
                    title: 'DMs',
                    headerShown: false,
                    headerStyle,
                    tabBarIcon: getTabBarIcon(ChatIcon),
                }}
            />
            <Tabs.Screen
                name="activity"
                options={{
                    title: 'Activity',
                    headerShown: false,
                    headerStyle,
                    tabBarIcon: getTabBarIcon(BellIcon),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerShown: false,
                    headerStyle,
                    tabBarIcon: getTabBarIcon(ProfileIcon),
                }}
            />
        </Tabs>
    )
}
