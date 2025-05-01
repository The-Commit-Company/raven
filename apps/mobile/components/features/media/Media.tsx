import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useColorScheme } from '@hooks/useColorScheme';
import { useState } from 'react';
import { useDebounce } from '@raven/lib/hooks/useDebounce';
import SearchInput from '@components/common/SearchInput/SearchInput';
import MediaTabs from './MediaTabs';
import HeaderBackButton from '@components/common/Buttons/HeaderBackButton';

export type MediaInChannel = {
    name: string;
    channel_id: string;
    owner: string;
    full_name: string;
    user_image: string;
    creation: string;
    file_name: string;
    file_size: number;
    file_type: string;
    file_url: string;
    message_type: "File" | "Image";
    thumbnail_width?: number;
    thumbnail_height?: number;
    file_thumbnail?: string;
};

export default function Media() {

    const { colors } = useColorScheme()

    const [searchText, setSearchText] = useState("")
    const debouncedText = useDebounce(searchText, 400)

    return (
        <>
            <Stack.Screen options={{
                title: 'Images and Files',
                headerLargeTitle: false,
                headerStyle: { backgroundColor: colors.background },
                headerLeft: () => <HeaderBackButton />,
            }} />
            <View className='flex-1 gap-3'>
                <View className='pt-3 px-3'>
                    <SearchInput
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Search images and files"
                    />
                </View>
                <MediaTabs searchQuery={debouncedText} />
            </View>
        </>
    )
}