import { Pressable, SafeAreaView, ScrollView, View } from 'react-native';
import { ThemeToggle } from '@components/nativewindui/ThemeToggle';
import { Text } from '@components/nativewindui/Text';
import { useColorScheme } from '@hooks/useColorScheme';
import PlusIcon from '@assets/icons/PlusIcon.svg';
import { SearchInput } from '@components/nativewindui/SearchInput';
import { router } from 'expo-router';
import ChannelList from '@components/features/channels/ChannelList/ChannelList';
import DMList from '@components/features/channels/DMList/DMList';
import WorkspaceSwitcher from '@components/features/workspaces/WorkspaceSwitcher';
import { Divider } from '@components/layout/Divider';
import { useGetCurrentWorkspace } from '@hooks/useGetCurrentWorkspace';

export default function Home() {

    const { colors } = useColorScheme()

    const { workspace, switchWorkspace } = useGetCurrentWorkspace()

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
            <View style={{ backgroundColor: colors.primary }} className="flex flex-col px-4 pb-4 pt-2 gap-2">
                <View className='flex-row items-center justify-between'>
                    <WorkspaceSwitcher workspace={workspace} setWorkspace={switchWorkspace} />
                    <ThemeToggle />
                </View>
                <SearchInput />
            </View>
            <ScrollView style={{ backgroundColor: colors.background }} className="rounded-t-[2rem]">
                <View className="flex flex-col">
                    <ChannelList workspace={workspace} />
                    <Divider />
                    <DMList />
                    <Divider />
                    <Pressable className='flex-row items-center p-5 rounded-lg'
                        onPress={() => console.log('Create channel pressed')}>
                        <PlusIcon fill={colors.icon} height={18} width={18} />
                        <Text className='ml-3 text-[16px]'>Add teammates</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}