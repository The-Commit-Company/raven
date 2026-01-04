import { useColorScheme } from '@hooks/useColorScheme';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

const DirectMessagesLayout = () => {

    const { t } = useTranslation()
    const { colors } = useColorScheme()

    return (
        <Stack screenOptions={{ headerStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name='index'
                options={{
                    title: t('channels.directMessages'),
                    headerLargeTitle: false
                }} />
        </Stack>
    )
}

export default DirectMessagesLayout