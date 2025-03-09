import { useState } from "react";
import { useFrappeGetCall } from "frappe-react-sdk";
import { KeyboardAvoidingView, Platform, View, Text, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import * as DropdownMenu from 'zeego/dropdown-menu'
import { useDebounce } from "@raven/lib/hooks/useDebounce";
import { usePagination } from "@hooks/usePagination";
import { PageLengthSelector } from "@components/features/pagination/PageLengthSelector";
import { PageSelector } from "@components/features/pagination/PageSelector";
import FilesTable from "@components/features/files/FilesTable";
import { useColorScheme } from "@hooks/useColorScheme";
import HeaderBackButton from "@components/common/HeaderBackButton";
import UniversalFileIcon from "@components/common/UniversalFileIcon";
import HollowFileIcon from "@assets/icons/HollowFileIcon.svg"
import { SearchInput } from "@components/nativewindui/SearchInput";

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

    const [searchText, setSearchText] = useState("");
    const debouncedText = useDebounce(searchText, 400);
    const [fileType, setFileType] = useState("any");

    const { id: channelID } = useLocalSearchParams();

    const { data: count } = useFrappeGetCall("raven.api.raven_message.get_count_for_pagination_of_files", {
        channel_id: channelID,
        file_name: debouncedText,
        file_type: fileType === "any" ? undefined : fileType,
    });

    const { start, selectedPageLength, setPageLength, nextPage, previousPage, goToPage } = usePagination(
        10,
        count?.message ?? 0
    );

    const { data, isLoading } = useFrappeGetCall("raven.api.raven_message.get_all_files_shared_in_channel", {
        channel_id: channelID,
        file_name: debouncedText,
        file_type: fileType === "any" ? undefined : fileType,
        start_after: start > 0 ? start - 1 : 0,
        page_length: selectedPageLength,
    });

    const onFileTypeSelect = (value: string) => {
        setFileType(value);
        goToPage(1)
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
                    <View className="flex flex-row items-center gap-2">
                        <View className="flex-1">
                            <SearchInput
                                style={{ backgroundColor: colors.grey6 }}
                                placeholder="Search"
                                placeholderTextColor={colors.grey}
                                onChangeText={setSearchText}
                                value={searchText}
                            />
                        </View>

                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                                <View className={`flex flex-row gap-1.5 items-center p-2 border border-border rounded-md ${fileType !== 'any' ? 'border-[0.5px] border-primary bg-primary/5' : ''}`}>
                                    {fileType === "any" ? (
                                        <HollowFileIcon width={18} height={18} fill={colors.icon} />
                                    ) : <UniversalFileIcon fileName={fileType} width={18} height={18} />}
                                    <Text className='dark:text-white text-sm'>{fileType === "any" ? "File Type" : fileTypes.find((type) => type.value === fileType)?.label}</Text>
                                </View>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                                {fileTypes.map((type) => (
                                    <DropdownMenu.Item key={type.value} onSelect={() => onFileTypeSelect(type.value)}>
                                        <DropdownMenu.ItemTitle>
                                            {type.label}
                                        </DropdownMenu.ItemTitle>
                                        <DropdownMenu.ItemIcon>
                                            <UniversalFileIcon fileName="IMG_0111375473.jpg" />
                                        </DropdownMenu.ItemIcon>
                                    </DropdownMenu.Item>
                                ))}
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    </View>

                    {data.message.length > 0 ? <View className="flex-row justify-between items-center py-2">
                        <PageLengthSelector
                            options={[10, 20, 50, 100]}
                            selectedValue={selectedPageLength}
                            updateValue={(value) => setPageLength(value)}
                        />
                        <PageSelector
                            rowsPerPage={selectedPageLength}
                            start={start}
                            totalRows={count?.message ?? 0}
                            gotoNextPage={nextPage}
                            gotoPreviousPage={previousPage}
                        />
                    </View> : null}

                    {isLoading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator color={colors.icon} />
                        </View>
                    ) : data?.message.length ? (
                        <FilesTable data={data.message} />
                    ) : (
                        <View className="flex-1 justify-center items-center">
                            <Text className="dark:text-white font-medium">Nothing to see here</Text>
                            <Text className="dark:text-white pt-2">No files found in this channel</Text>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </>
    );
};

export default ViewFiles;
