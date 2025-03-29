import { Stack } from 'expo-router';
import { Platform, ScrollView, View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import LogOutButton from '@components/features/profile/profile-settings/LogOutButton';
import NotificationSetting from '@components/features/profile/profile-settings/NotificationSetting';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppearanceSetting from '@components/features/profile/profile-settings/AppearanceSetting';
import UserAvailability from '@components/features/profile/profile-settings/UserAvailability';
import UserFullName from '@components/features/profile/profile-settings/UserFullName';
import CustomStatus from '@components/features/profile/profile-settings/CustomStatus';
import ProfilePicture from '@components/features/profile/upload-profile/ProfilePicture';
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application';
import Preferences from '@components/features/profile/profile-settings/Preferences';
import SwitchSitesSetting from '@components/features/profile/profile-settings/SwitchSitesSetting';
import CommonErrorBoundary from '@components/common/CommonErrorBoundary';

const SCREEN_OPTIONS = {
    title: 'Profile',
    headerTransparent: Platform.OS === 'ios',
    headerBlurEffect: 'systemMaterial',
} as const

export default function Profile() {

    const insets = useSafeAreaInsets()

    return (
        <>
            <Stack.Screen options={SCREEN_OPTIONS} />
            <View className='flex-1 px-4'>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: insets.bottom }}>
                    <View className='flex flex-col gap-4 mt-1.5'>
                        <ProfilePicture />
                        <View className='flex flex-col gap-0.5'>
                            <Text className='pl-2 pb-1 text-xs text-muted-foreground/80'>Personal Info</Text>
                            <UserFullName />
                            <CustomStatus />
                            <UserAvailability />
                        </View>
                        <View className='flex flex-col gap-0.5'>
                            <Text className='pl-2 pb-1 text-xs text-muted-foreground/80'>Preferences</Text>
                            <NotificationSetting />
                            <AppearanceSetting />
                            <Preferences />
                            <SwitchSitesSetting />
                        </View>
                        <LogOutButton />
                        <View className='flex flex-col justify-center items-center pt-2 gap-1'>
                            <Text className='text-lg text-muted-foreground/90 font-cal-sans'>raven</Text>
                            <View className='flex flex-col items-center justify-center'>
                                <Text className='text-xs text-muted-foreground/80'>by The Commit Company</Text>
                                <Text className='text-xs text-muted-foreground/80'>Version {nativeApplicationVersion} ({nativeBuildVersion})</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </>
    )
}

export const ErrorBoundary = CommonErrorBoundary