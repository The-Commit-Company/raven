import { Text } from '@components/nativewindui/Text'
import { useColorScheme } from '@hooks/useColorScheme'
import { TouchableOpacity, View } from 'react-native'
import SearchIcon from '@assets/icons/SearchIcon.svg';
import { router } from 'expo-router';

const QuickSearchButton = () => {

    const { isDarkColorScheme } = useColorScheme()
    const searchIconColor = isDarkColorScheme ? '#9ca3af' : '#d1d5db'

    return (
        <View className='pt-1 pb-1'>
            <TouchableOpacity onPress={() => router.push('../home/quick-search', { relativeToDirectory: true })}>
                <View className={'flex-row items-center gap-2 rounded-lg px-2.5 py-2 bg-[#6c69cd] dark:bg-[#4c49ad]'}>
                    <SearchIcon width={18} height={18} fill={searchIconColor} />
                    <Text className='text-base text-gray-300 dark:text-gray-400'>Jump to or search...</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default QuickSearchButton