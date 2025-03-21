import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useColorScheme } from '@hooks/useColorScheme';
import FilesTabs from './FIlesTabs';
import { useState } from 'react';
import { useDebounce } from '@raven/lib/hooks/useDebounce';
import SearchInput from '@components/common/SearchInput/SearchInput';

export type FileInChannel = {
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

export const GET_FILES_END_POINTS = 'raven.api.raven_message.get_all_files_shared_in_channel'

export default function Files() {
    const { colors } = useColorScheme()

    const [searchText, setSearchText] = useState("");
    const debouncedText = useDebounce(searchText, 400);

    return (
        <>
            <Stack.Screen options={{
                title: 'Images and Documents',
                headerLargeTitle: false,
                headerStyle: { backgroundColor: colors.background },
                headerBackButtonDisplayMode: 'minimal'
            }} />
            <View className='flex-1 gap-3'>
                <View className='pt-3 px-3'>
                    <SearchInput
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Search files"
                    />
                </View>
                <FilesTabs searchQuery={debouncedText} />
            </View>
        </>
    )
}