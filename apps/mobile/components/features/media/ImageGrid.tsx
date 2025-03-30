import { useCallback, useContext } from 'react';
import { FrappeConfig, FrappeContext, useSWRInfinite } from 'frappe-react-sdk';
import { Dimensions, Platform, Pressable, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { LegendList } from '@legendapp/list';
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import { useColorScheme } from '@hooks/useColorScheme';
import { MediaInChannel } from './Media';
import { useOpenFileOnAndroid } from '@hooks/useOpenFileOnAndroid';
import useFileURL from '@hooks/useFileURL';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';
import { Text } from '@components/nativewindui/Text';
import ErrorBanner from '@components/common/ErrorBanner';

const PAGE_SIZE = 18

const ImageGrid = ({ searchQuery, gap = 6, columns = 3 }: { searchQuery: string, gap?: number, columns?: number }) => {

    const { colors } = useColorScheme();
    const { id: channelID } = useLocalSearchParams();
    const { call } = useContext(FrappeContext) as FrappeConfig;

    const { data, size, isLoading, setSize, error } = useSWRInfinite<MediaInChannel[]>(
        (pageIndex: number, previousPageData: MediaInChannel[] | null) => {
            if (previousPageData && previousPageData.length === 0) return null;
            return {
                channel_id: channelID,
                file_name: searchQuery,
                file_type: "image",
                page_length: PAGE_SIZE,
                start_after: pageIndex * PAGE_SIZE,
            };
        },
        async (params) => {
            const response = await call.get("raven.api.raven_message.get_all_files_shared_in_channel", params);
            return response.message;
        },
        {
            revalidateIfStale: true,
            revalidateOnFocus: true,
        }
    );

    const images = data ? data.flat() : [];
    const isEmpty = images.length === 0;
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE);

    const loadMore = useCallback(() => {
        if (!isReachingEnd && !isLoadingMore) {
            setSize((prevSize) => prevSize + 1);
        }
    }, [isReachingEnd, isLoadingMore, setSize]);

    const screenWidth = Dimensions.get('window').width - 6 // 6 = padding(px-3)

    const imageSize = (screenWidth - (gap * (columns - 1))) / columns;

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center h-full">
                <ActivityIndicator />
            </View>
        );
    }

    if (error) {
        return (
            <View className="pt-4">
                <ErrorBanner error={error} />
            </View>
        )
    }

    if (isEmpty) {
        return <EmptyStateForImageGrid />
    }

    return (
        <View className='flex-1 px-3 mt-3'>
            <LegendList
                data={images}
                renderItem={({ item }) => <ImageListItem file={item} />}
                numColumns={columns}
                estimatedItemSize={imageSize}
                keyExtractor={(item, index) => `${item?.name}-${index}`}
                contentContainerStyle={{ backgroundColor: colors.background, paddingBottom: 40 }}
                columnWrapperStyle={{ gap }}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isLoadingMore ? (
                        <View className="py-4">
                            <ActivityIndicator />
                        </View>
                    ) : undefined
                }
            />
        </View>
    );
};

export default ImageGrid

const ImageListItem = ({ file }: { file: MediaInChannel }) => {

    const { openFile: openFileOnAndroid } = useOpenFileOnAndroid()

    const source = useFileURL(file?.file_url ?? "");

    const openFileAction = () => {
        if (file.file_type === "File") {
            if (Platform.OS === 'ios') {
                router.push({
                    pathname: './file-viewer',
                    params: { uri: source?.uri },
                })
            }
            else {
                openFileOnAndroid(source as WebViewSourceUri)
            }
        } else {
            router.push({
                pathname: './file-viewer',
                params: { uri: source?.uri },
            })
        }
    }

    const { colors } = useColorScheme()

    return (
        <Pressable onPress={openFileAction}>
            <Image
                source={source}
                style={{
                    borderRadius: 6,
                    aspectRatio: 1,
                    backgroundColor: colors.grey6,
                    borderWidth: 1,
                    borderColor: colors.grey6,
                }}
                contentFit="cover"
                transition={200}
                alt={file.file_name}
                cachePolicy="memory"
            />
        </Pressable>
    )
}

const EmptyStateForImageGrid = () => {
    return (
        <View className="flex flex-row items-center gap-2 py-6 px-3">
            <Text className="text-muted-foreground text-center w-full text-base font-medium">
                No images found
            </Text>
        </View>
    )
}