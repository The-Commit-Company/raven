import { ScrollView } from 'react-native';
import { useColorScheme } from '@hooks/useColorScheme';
import AllDMsList from '@components/features/channels/DMList/AllDMsList';
import { useGetCurrentWorkspace } from '@hooks/useGetCurrentWorkspace';

export default function DirectMessages() {
    const { colors } = useColorScheme()
    const { workspace } = useGetCurrentWorkspace()

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 5 }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: colors.background }}
        >
            <AllDMsList workspace={workspace} />
        </ScrollView>
    )
}