import useFileDownload from "@hooks/useFileDownload";
import useFileURLCopy from "@hooks/useFileURLCopy";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import LinkIcon from "@assets/icons/LinkIcon.svg"
import DownloadIcon from "@assets/icons/DownloadIcon.svg"
import { FileInChannel } from "app/[site_id]/chat/[id]/view-files";
import { formatDate } from "@raven/lib/utils/dateConversions";
import UniversalFileIcon from "@components/common/UniversalFileIcon";
import { useColorScheme } from "@hooks/useColorScheme";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useOpenFileOnAndroid } from "@hooks/useOpenFileOnAndroid";
import useFileURL from "@hooks/useFileURL";
import { formatBytes, getFileName } from "@raven/lib/utils/operations";
import { useMemo } from "react";
import { WebViewSourceUri } from "react-native-webview/lib/WebViewTypes";

const FilesTable = ({ data }: { data: FileInChannel[] }) => {
    const insets = useSafeAreaInsets();

    return (
        <FlashList
            data={data}
            keyExtractor={(item, index) => item.file_url + item.file_name + index}
            renderItem={({ item }) => <FileTableRow file={item} />}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            estimatedItemSize={78}
            contentContainerStyle={{ paddingTop: 5, paddingBottom: insets.bottom + 20 }}
            contentInsetAdjustmentBehavior="automatic"
        />
    );
};

export default FilesTable;

const FileTableRow = ({ file }: { file: FileInChannel }) => {

    const { colors } = useColorScheme()

    const copy = useFileURLCopy(file?.file_url);
    const download = useFileDownload(file?.file_url, file?.file_name);

    return (
        <View className="bg-card p-2.5 mb-2.5 rounded-md">
            <View className="flex-row items-start justify-between">
                <View className="flex-row gap-2 items-start">
                    <Preview file={file} />

                    <View>
                        <View className="gap-1 w-[260px]">
                            <Text className="text-foreground">
                                {file.file_name.length < 30 ? file.file_name : file.file_name.slice(0, 30) + "..."}
                            </Text>
                            <Text className="text-xs text-muted">{formatBytes(file.file_size)}</Text>
                        </View>
                        <Text className="text-muted-foreground text-xs mt-1">
                            by {file.full_name ?? file.owner} on {formatDate(file.creation)}
                        </Text>
                    </View>
                </View>
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={copy}
                        className="bg-white dark:bg-black border-[0.5px] border-muted p-1.5 rounded-md"
                        activeOpacity={0.7}
                    >
                        <LinkIcon width={14} height={14} fill={colors.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={download}
                        className="bg-white dark:bg-black border-[0.5px] border-muted p-1.5 rounded-md"
                        activeOpacity={0.7}
                    >
                        <DownloadIcon width={14} height={14} fill={colors.icon} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const Preview = ({ file }: { file: FileInChannel }) => {

    const { openFile: openFileOnAndroid } = useOpenFileOnAndroid()

    const source = useFileURL(file?.file_url ?? "");

    const fileName = useMemo(() => getFileName(file.file_url ?? ""), [file])

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
        <TouchableOpacity activeOpacity={0.6} onPress={openFileAction} className="bg-white dark:bg-black border-[0.5px] border-muted rounded-md p-3">
            <UniversalFileIcon fileName={fileName} width={28} height={28} />
        </TouchableOpacity>
    )
}