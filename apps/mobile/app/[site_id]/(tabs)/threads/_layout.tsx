import { useColorScheme } from '@hooks/useColorScheme';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

const ThreadsLayout = () => {

    const { t } = useTranslation()
    const { colors } = useColorScheme()

    return (
        <Stack screenOptions={{ headerStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name='index'
                options={{
                    title: t('threads.threads'),
                    headerLargeTitle: true
                }} />
        </Stack>
    )
}

export default ThreadsLayout