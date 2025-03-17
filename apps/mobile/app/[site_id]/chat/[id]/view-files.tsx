import { useMemo, useState } from "react";
import { useFrappeGetCall } from "frappe-react-sdk";
import { KeyboardAvoidingView, Platform, View, Text, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import * as DropdownMenu from 'zeego/dropdown-menu'
import { useDebounce } from "@raven/lib/hooks/useDebounce";
import FilesTable from "@components/features/files/FilesTable";
import { useColorScheme } from "@hooks/useColorScheme";
import HeaderBackButton from "@components/common/HeaderBackButton";
import UniversalFileIcon from "@components/common/UniversalFileIcon";
import HollowFileIcon from "@assets/icons/HollowFileIcon.svg"
import SearchInput from "@components/common/SearchInput/SearchInput";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

export const fileTypes = [
    { value: "any", label: "Any" },
    { value: "pdf", label: "PDF" },
    { value: "doc", label: "Documents (.doc)" },
    { value: "ppt", label: "Presentations (.ppt)" },
    { value: "xls", label: "Spreadsheets (.xls)" },
    { value: "image", label: "Images" },
];

const ViewFiles = () => {
    const { colors } = useColorScheme()

    const insets = useSafeAreaInsets()

    const [searchText, setSearchText] = useState("");
    const debouncedText = useDebounce(searchText, 400);
    const [fileType, setFileType] = useState("any");

    const { id: channelID } = useLocalSearchParams();

    const { data, isLoading } = useFrappeGetCall("raven.api.raven_message.get_all_files_shared_in_channel", {
        channel_id: channelID,
        file_name: debouncedText,
        file_type: fileType === "any" ? undefined : fileType
    }, undefined);

    const onFileTypeSelect = (fileType: string) => {
        setFileType(fileType);
    };

    const fileTypeName = useMemo(() => {
        return fileType === "any" ? "" : fileTypes.find((type) => type.value === fileType)?.label;
    }, [fileType]);

    const onSearchText = (value: string) => {
        setSearchText(value)
    }

    return (
        <>
            <Stack.Screen options={{
                headerStyle: { backgroundColor: colors.background },
                headerLeft() {
                    return (
                        <HeaderBackButton />
                    )
                },
                headerTitle: () => <Text className='ml-2 dark:text-white text-base font-semibold'>View Files</Text>,
            }} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View className="flex-1 p-3">
                    <View className="flex flex-row items-center gap-2 pb-2.5">
                        <View className="flex-1">
                            <SearchInput
                                value={searchText}
                                onChangeText={onSearchText}
                                placeholder="Search files"
                            />
                        </View>

                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                                <View className={`flex flex-row gap-1.5 items-center p-2 border border-border rounded-md ${fileType !== 'any' ? 'border-[0.5px] border-primary bg-primary/5' : ''}`}>
                                    {fileType === "any" ? (
                                        <HollowFileIcon width={18} height={18} fill={colors.icon} />
                                    ) : <UniversalFileIcon fileName={fileType === "image" ? ".png" : fileType} width={18} height={18} />}
                                    <Text className='dark:text-white text-sm'>{fileType === "any" ? "File Type" : fileTypes.find((type) => type.value === fileType)?.label}</Text>
                                </View>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                                {fileTypes.map((type) => (
                                    <DropdownMenu.Item key={type.value} onSelect={() => onFileTypeSelect(type.value)}>
                                        <DropdownMenu.ItemTitle>
                                            {type.label}
                                        </DropdownMenu.ItemTitle>
                                    </DropdownMenu.Item>
                                ))}
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    </View>

                    {isLoading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator color={colors.icon} />
                        </View>
                    ) : data?.message.length ? (
                        <FilesTable data={data.message} />
                    ) : (
                        <View className="flex-1 justify-center items-center">
                            <Text className="dark:text-white font-medium">Nothing to see here</Text>
                            <Text className="dark:text-white pt-2">
                                No files found in this channel{fileType !== "any" && ` of type `}
                                <Text className="font-bold">{fileTypeName}</Text>
                            </Text>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </>
    );
};

export default ViewFiles;