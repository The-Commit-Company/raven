import { router, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { Button } from '@components/nativewindui/Button';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
    const { t } = useTranslation()
    const { getItem } = useAsyncStorage(`default-site`)

    const handleGoHome = () => {
        getItem().then(site => {
            if (site) {
                router.replace(`/${site}`)
            } else {
                router.replace('/landing')
            }
        })
    }
    return (
        <>
            <Stack.Screen options={{ title: t('errors.oops') }} />
            <View className='flex-1 bg-background justify-center gap-3 items-center'>
                <Text className='text-3xl text-foreground'>{t('errors.screenNotFound')}</Text>
                <View className='h-2' />
                <Button onPress={handleGoHome}>
                    <Text>{t('common.goHome')}</Text>
                </Button>
            </View>
        </>
    );
}