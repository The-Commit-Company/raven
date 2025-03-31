import { SafeAreaView, ScrollView, View } from 'react-native';
import { ThemeToggle } from '@components/nativewindui/ThemeToggle';
import { useColorScheme } from '@hooks/useColorScheme';
import WorkspaceSwitcher from '@components/features/workspaces/WorkspaceSwitcher';
import { useGetCurrentWorkspace } from '@hooks/useGetCurrentWorkspace';
import { ViewSavedMessagesButton } from '@components/features/saved-messages/ViewSavedMessagesButton';
import QuickSearchButton from '@components/features/search/QuickSearchButton';
import AllChannelsList from '@components/features/channels/ChannelList/AllChannelsList';
import { ViewMentionsButton } from '@components/features/mentions/ViewMentionsButton';
import CommonErrorBoundary from '@components/common/CommonErrorBoundary';

export default function Home() {

    const { colors } = useColorScheme()
    const { workspace, switchWorkspace } = useGetCurrentWorkspace()

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
            <View style={{ backgroundColor: colors.primary }} className="flex flex-col px-4 pb-3 pt-2 gap-2 android:pt-12">
                <View className='flex-row items-center justify-between'>
                    <WorkspaceSwitcher workspace={workspace} setWorkspace={switchWorkspace} />
                    <View className='flex-row items-center gap-3'>
                        <ViewMentionsButton />
                        <ViewSavedMessagesButton />
                        <ThemeToggle />
                    </View>
                </View>
                <QuickSearchButton />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 5 }}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1, backgroundColor: colors.background }}
                className="rounded-t-[1.2rem]">
                <View className="flex flex-col">
                    <AllChannelsList workspace={workspace} />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export const ErrorBoundary = CommonErrorBoundary