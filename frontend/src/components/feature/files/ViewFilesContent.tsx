import { useDebounce } from "@/hooks/useDebounce"
import { usePagination } from "@/hooks/usePagination"
import { useFrappeGetCall } from "frappe-react-sdk"
import { ChangeEvent, useState } from "react"
import { Box, Dialog, Flex, Heading, IconButton, Select, Text, TextField } from "@radix-ui/themes"
import { BiSearch } from "react-icons/bi"
import { IoMdClose } from "react-icons/io"
import { PageLengthSelector } from "../pagination/PageLengthSelector"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { TableLoader } from "@/components/layout/Loaders/TableLoader"
import { PageSelector } from "../pagination/PageSelector"
import { FilesTable } from "./FilesTable"
import { useParams } from "react-router-dom"
import { Loader } from "@/components/common/Loader"
import { FileExtensionIcon } from "@/utils/layout/FileExtIcon"
import { useIsDesktop, useIsMobile } from "@/hooks/useMediaQuery"

export type FileInChannel = {
    name: string,
    channel_id: string,
    owner: string,
    full_name: string,
    user_image: string,
    creation: string,
    file_name: string,
    file_size: number,
    file_type: string,
    file_url: string,
    message_type: 'File' | 'Image',
    thumbnail_width?: number,
    thumbnail_height?: number,
    file_thumbnail?: string
}

const ViewFilesContent = () => {

    const [searchText, setSearchText] = useState("")
    const debouncedText = useDebounce(searchText, 200)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value)
    }

    const { channelID } = useParams<{ channelID: string }>()
    const [fileType, setFileType] = useState<string | undefined>()

    const { data: count, error: countError } = useFrappeGetCall<{ message: number }>("raven.api.raven_message.get_count_for_pagination_of_files", {
        "channel_id": channelID,
        "file_name": debouncedText,
        "file_type": fileType === 'any' ? undefined : fileType
    })

    const { start, selectedPageLength, setPageLength, nextPage, previousPage } = usePagination(10, count?.message ?? 0)

    const { data, error, isLoading } = useFrappeGetCall<{ message: FileInChannel[] }>("raven.api.raven_message.get_all_files_shared_in_channel", {
        "channel_id": channelID,
        "file_name": debouncedText,
        "file_type": fileType === 'any' ? undefined : fileType,
        "start_after": start > 0 ? (start - 1) : 0,
        "page_length": selectedPageLength
    })

    const isDesktop = useIsDesktop()

    return (
        <div>
            <Flex justify='between' gap='2'>
                <Dialog.Title>Files shared in this channel</Dialog.Title>
                {isDesktop &&
                    <Dialog.Close>
                        <IconButton size='1' color='gray' variant="soft" aria-label="close dialog">
                            <IoMdClose />
                        </IconButton>
                    </Dialog.Close>
                }
            </Flex>
            <Flex direction='column' gap='4' className='pt-0 sm:pt-4 h-[80vh] sm:max-h-[75vh] sm:min-h-[75vh]'>
                <Flex justify='between' gap='2' className="flex-col sm:flex-row">
                    <Flex gap='2' className="flex-col sm:flex-row sm:items-center">
                        <TextField.Root className="w-full sm:w-[400px]" onChange={handleChange}
                            type='text'
                            placeholder='Search for file' autoFocus>
                            <TextField.Slot side='left'>
                                <BiSearch />
                            </TextField.Slot>
                            <TextField.Slot side='right'>
                                {isLoading && <Loader />}
                            </TextField.Slot>
                        </TextField.Root>
                        <Select.Root value={fileType} onValueChange={setFileType}>
                            <Select.Trigger placeholder='File Type' className="w-full sm:w-[200px]" />
                            <Select.Content className="z-50">
                                <Select.Group>
                                    <Select.Label>File Type</Select.Label>
                                    <Select.Item value='any'>
                                        <Flex align='center' gap='1'>
                                            <Box width='16px'>
                                                🤷🏻‍♀️
                                            </Box>
                                            Any
                                        </Flex>
                                    </Select.Item>
                                    <Select.Item value='pdf'>
                                        <Flex gap='2'>
                                            <FileExtensionIcon ext={'pdf'} size='14' style={{ paddingTop: 2 }} />
                                            PDF
                                        </Flex>
                                    </Select.Item>
                                    <Select.Item value='doc'>
                                        <Flex gap='2'>
                                            <FileExtensionIcon ext={'doc'} size='14' style={{ paddingTop: 2 }} />
                                            Documents (.doc)
                                        </Flex>
                                    </Select.Item>
                                    <Select.Item value='ppt'>
                                        <Flex gap='2'>
                                            <FileExtensionIcon ext={'ppt'} size='14' style={{ paddingTop: 2 }} />
                                            Presentations (.ppt)
                                        </Flex>
                                    </Select.Item>
                                    <Select.Item value='xls'>
                                        <Flex gap='2'>
                                            <FileExtensionIcon ext={'xls'} size='14' style={{ paddingTop: 2 }} />
                                            Spreadsheets (.xls)
                                        </Flex>
                                    </Select.Item>
                                    <Select.Item value='image'>
                                        <Flex gap='2'>
                                            <FileExtensionIcon ext='jpg' size='14' style={{ paddingTop: 2 }} />
                                            Images
                                        </Flex>
                                    </Select.Item>
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                        {debouncedText.length > 0 && debouncedText.length < 2 && <Text size='1' color="gray">Continue typing...</Text>}
                    </Flex>
                    <Flex justify='end' gap='2' align='center'>
                        <PageLengthSelector
                            options={[10, 20, 50, 100]}
                            selectedValue={selectedPageLength}
                            updateValue={(value) => setPageLength(value)} />
                        <PageSelector
                            rowsPerPage={selectedPageLength}
                            start={start}
                            totalRows={count?.message ?? 0}
                            gotoNextPage={() => nextPage()}
                            gotoPreviousPage={() => previousPage()} />
                    </Flex>
                </Flex>

                <ErrorBanner error={error} />
                <ErrorBanner error={countError} />

                {!data && !error && <TableLoader columns={3} />}

                {data && data.message.length === 0 && (debouncedText.length >= 2 || debouncedText.length == 0) &&
                    <Flex align='center' justify='center' direction='column' gap='2' className="min-h-[32rem]">
                        <Heading size='3'>Nothing to see here</Heading>
                        <Text size='2' align='center'>No files found in this channel</Text>
                    </Flex>}

                {data && data.message.length !== 0 && <FilesTable data={data.message} />}

            </Flex>
        </div>
    )
}

export default ViewFilesContent