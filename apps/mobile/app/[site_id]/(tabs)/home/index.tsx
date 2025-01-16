import { SafeAreaView, ScrollView, View } from 'react-native';
import { ThemeToggle } from '@components/nativewindui/ThemeToggle';
import { useColorScheme } from '@hooks/useColorScheme';
import { SearchInput } from '@components/nativewindui/SearchInput';
import DMList from '@components/features/channels/DMList/DMList';
import WorkspaceSwitcher from '@components/features/workspaces/WorkspaceSwitcher';
import { Divider } from '@components/layout/Divider';
import { useGetCurrentWorkspace } from '@hooks/useGetCurrentWorkspace';
import ChannelList from '@components/features/channels/ChannelList/ChannelList';
import { ViewNotificationsButton } from '@components/features/notifications/ViewNotificationsButton';
import { ViewSavedMessagesButton } from '@components/features/saved-messages/ViewSavedMessagesButton';
import QuickActionsFab from '@components/features/quick-actions-fab/QuickActionsFab';

export default function Home() {

    const { colors } = useColorScheme()
    const { workspace, switchWorkspace } = useGetCurrentWorkspace()

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
            <View style={{ backgroundColor: colors.primary }} className="flex flex-col px-4 pb-4 pt-2 gap-2">
                <View className='flex-row items-center justify-between'>
                    <WorkspaceSwitcher workspace={workspace} setWorkspace={switchWorkspace} />
                    <View className='flex-row items-center gap-3'>
                        <ViewNotificationsButton />
                        <ViewSavedMessagesButton />
                        <ThemeToggle />
                    </View>
                </View>
                <SearchInput />
            </View>

            <View style={{ flex: 1 }}>
                <ScrollView
                    style={{ backgroundColor: colors.background }}
                    contentContainerStyle={{ paddingBottom: 5 }}
                    className="rounded-t-[1.2rem]">
                    <View className="flex flex-col">
                        <ChannelList workspace={workspace} />
                        <Divider />
                        <DMList />
                    </View>
                </ScrollView>
                <QuickActionsFab />
            </View>
        </SafeAreaView>
    )
}