import { ScrollView } from 'react-native';
import { useColorScheme } from '@hooks/useColorScheme';
import AllDMsList from '@components/features/channels/DMList/AllDMsList';

export default function DirectMessages() {
    const { colors } = useColorScheme()

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 5 }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: colors.background }}
        >
            <AllDMsList />
        </ScrollView>
    )
}