import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import AddSite from '@components/features/auth/AddSite';
import SitesList from '@components/features/auth/SitesList';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommonErrorBoundary from '@components/common/CommonErrorBoundary';
import { useTranslation } from 'react-i18next';

export default function LandingScreen() {
    const { t } = useTranslation()

    return (
        <>
            <Stack.Screen options={{ title: t('auth.sites'), headerShown: false }} />
            <SafeAreaView className='flex-1 bg-background'>
                <View className='flex-1 justify-center h-screen pt-24 px-6 gap-3 bg-background'>
                    <Text className='text-5xl font-cal-sans text-foreground'>{t('common.appName').toLowerCase()}</Text>
                    <View className='h-2' />
                    <SitesList />
                    <AddSite />
                </View>
            </SafeAreaView>
        </>
    );
}

export const ErrorBoundary = CommonErrorBoundary