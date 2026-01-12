import { Stack } from 'expo-router';
import FullPageLoader from '@components/layout/FullPageLoader';
import { __ } from '@lib/i18n';

export default function InitialScreen() {
return (
        <>
            <Stack.Screen options={{ title: __("Raven") }} />
            <FullPageLoader />
        </>
    );
}