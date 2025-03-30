import { Platform, Pressable, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router';
import { FrappeConfig, FrappeContext, useSWRInfinite } from 'frappe-react-sdk';
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import { useColorScheme } from '@hooks/useColorScheme';
import { MediaInChannel } from './Media';
import { useOpenFileOnAndroid } from '@hooks/useOpenFileOnAndroid';
import useFileURL from '@hooks/useFileURL';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';
import ErrorBanner from '@components/common/ErrorBanner';
import { useCallback, useContext, useMemo } from 'react';
import { Text } from '@components/nativewindui/Text';
import { Divider } from '@components/layout/Divider';
import { formatBytes, getFileName } from '@raven/lib/utils/operations';
import UniversalFileIcon from '@components/common/UniversalFileIcon';
import DotIcon from "@assets/icons/DotIcon.svg"
import { formatDate } from '@raven/lib/utils/dateConversions';
import { LegendList } from '@legendapp/list';

const PAGE_SIZE = 12

const FileGrid = ({ searchQuery }: { searchQuery: string }) => {

    const { colors } = useColorScheme()
    const { id: channelID } = useLocalSearchParams()
    const { call } = useContext(FrappeContext) as FrappeConfig

    const { data, size, isLoading, setSize, error } = useSWRInfinite<MediaInChannel[]>(
        (pageIndex: number, previousPageData: MediaInChannel[] | null) => {
            if (previousPageData && previousPageData.length === 0) return null
            return {
                channel_id: channelID,
                file_name: searchQuery,
                file_type: "file",
                page_length: PAGE_SIZE,
                start_after: pageIndex * PAGE_SIZE,
            }
        },
        async (params) => {
            const response = await call.get("raven.api.raven_message.get_all_files_shared_in_channel", params)
            return response.message;
        },
        {
            revalidateIfStale: true,
            revalidateOnFocus: true,
        }
    )

    const documents = data ? data.flat() : []
    const isEmpty = documents?.length === 0
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined")
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE)

    const loadMore = useCallback(() => {
        if (!isReachingEnd && !isLoadingMore) {
            setSize((prevSize) => {
                return prevSize + 1
            })
        }
    }, [isReachingEnd, isLoadingMore, setSize])

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center h-full">
                <ActivityIndicator />
            </View>
        )
    }

    if (error) {
        return (
            <View className="p-4">
                <ErrorBanner error={error} />
            </View>
        )
    }

    if (isEmpty) {
        return <EmptyStateForDocGrid />
    }

    return (
        <LegendList
            data={documents}
            renderItem={({ item }) => <FileListItem file={item} />}
            estimatedItemSize={56}
            keyExtractor={(item, index) => `${item?.name}-${index}`}
            contentContainerStyle={{ backgroundColor: colors.background, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ItemSeparatorComponent={() => <Divider prominent />}
            ListFooterComponent={
                isLoadingMore ? (
                    <View className="py-4">
                        <ActivityIndicator />
                    </View>
                ) : undefined
            }
            recycleItems
        />
    )
}

export default FileGrid

const FileListItem = ({ file }: { file: MediaInChannel }) => {

    const { colors } = useColorScheme()

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

    return (
        <Pressable onPress={openFileAction}
            // Use tailwind classes for layout and ios:active state
            className='flex-row items-center px-3 py-2.5 rounded active:bg-linkColor'
            // Add a subtle ripple effect on Android
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <View className="flex-row gap-3 items-center">
                <Preview file={file} />
                <View className="gap-1 flex-1">
                    <Text className="text-foreground text-sm line-clamp-1">
                        {file.file_name}
                    </Text>
                    <View className='flex-row justify-between'>
                        <View className="flex-row items-center gap-1.5">
                            <Text className='text-muted-foreground text-xs'>
                                Sent by {file.full_name ?? file.owner}
                            </Text>
                            <DotIcon fill={colors.foreground} width={2.5} height={2.5} />
                            <Text className='text-muted-foreground/90 text-xs'>{formatBytes(file.file_size)}</Text>
                            <Text className='text-muted-foreground/90 text-xs'>{file.file_type}</Text>
                        </View>
                        <Text className='text-muted-foreground text-xs'>{formatDate(file.creation)}</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

const Preview = ({ file }: { file: MediaInChannel }) => {
    const fileName = useMemo(() => getFileName(file.file_url ?? ""), [file])
    return (
        <UniversalFileIcon fileName={fileName} width={35} height={35} />
    )
}

const EmptyStateForDocGrid = () => {
    return (
        <View className="flex flex-row items-center gap-2 py-6 px-3">
            <Text className="text-muted-foreground text-center w-full text-base font-medium">
                No documents found
            </Text>
        </View>
    )
}