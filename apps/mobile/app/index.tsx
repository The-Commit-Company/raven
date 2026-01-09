import { Stack } from 'expo-router';
import FullPageLoader from '@components/layout/FullPageLoader';
import { useTranslation } from 'react-i18next';

export default function InitialScreen() {
    const { t } = useTranslation()

    return (
        <>
            <Stack.Screen options={{ title: t('common.appName') }} />
            <FullPageLoader />
        </>
    );
}