import { Pressable, SafeAreaView, ScrollView, View } from 'react-native';
import { ThemeToggle } from '@components/nativewindui/ThemeToggle';
import { Text } from '@components/nativewindui/Text';
import { useColorScheme } from '@hooks/useColorScheme';
import PlusIcon from '@assets/icons/PlusIcon.svg';
import { SearchInput } from '@components/nativewindui/SearchInput';
import ChannelList from '@components/features/chat/ChannelList/ChannelList';
import DMList from '@components/features/chat/DMList/DMList';
import { router } from 'expo-router';

export default function Home() {

    const { colors } = useColorScheme()

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
            <View style={{ backgroundColor: colors.primary }} className="flex flex-col px-4 pb-4 pt-2 gap-2">
                <View className='flex-row items-center justify-between'>
                    <Pressable onPress={() => console.log('Workspace pressed')}>
                        <Text className="text-white font-bold">Workspace</Text>
                    </Pressable>
                    <ThemeToggle />
                </View>
                <SearchInput />
            </View>
            <ScrollView style={{ backgroundColor: colors.background }} className="rounded-t-[2rem]">
                <View className="flex flex-col">
                    <ChannelList />
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

const Divider = () => {
    const { colors } = useColorScheme()
    return (
        <View
            style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.grey5,
                marginHorizontal: 16
            }}
        />
    )
}