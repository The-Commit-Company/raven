import { useDebounce } from "@/hooks/useDebounce"
import { usePaginationWithDoctype } from "@/hooks/usePagination"
import { Filter, useFrappeGetCall } from "frappe-react-sdk"
import { ChangeEvent, useState } from "react"
import { Dialog, Flex, IconButton, Text, TextField } from "@radix-ui/themes"
import { BiSearch } from "react-icons/bi"
import { IoMdClose } from "react-icons/io"
import { Sort } from "../sorting"
import { PageLengthSelector } from "../pagination/PageLengthSelector"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { TableLoader } from "@/components/layout/Loaders/TableLoader"
import { PageSelector } from "../pagination/PageSelector"
import { FilesTable } from "./FilesTable"
import { useParams } from "react-router-dom"

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
}

const ViewFilesContent = () => {

    const [searchText, setSearchText] = useState("")
    const debouncedText = useDebounce(searchText, 200)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value)
    }

    const { channelID } = useParams<{ channelID: string }>()

    const filters: Filter[] = [['channel_id', '=', channelID ?? ''], ['message_type', '=', 'Image']]

    const { start, count, selectedPageLength, setPageLength, nextPage, previousPage } = usePaginationWithDoctype("Raven Message", 10, filters)
    const [sortOrder, setSortOder] = useState<"asc" | "desc">("desc")
    const [sortByField, setSortByField] = useState<string>('creation')

    const { data, error } = useFrappeGetCall<{ message: FileInChannel[] }>("raven.api.raven_message.get_all_files_shared_in_channel", {
        "channel_id": channelID,
        "file_name": debouncedText,
        // "file_type":,
        "start_after": start > 0 ? (start - 1) : 0,
        "page_length": selectedPageLength,
        "sort_field": sortByField !== '' ? sortByField : 'creation',
        "sort_order": sortOrder,
    })


    console.log(data)

    return (
        <div>
            <Flex justify='between' gap='2'>
                <Dialog.Title>Files</Dialog.Title>
                <Dialog.Close>
                    <IconButton size='1' color='gray' variant="soft" aria-label="close dialog">
                        <IoMdClose />
                    </IconButton>
                </Dialog.Close>
            </Flex>
            <Flex direction='column' gap='4' pt='4' className='max-h-[80vh]'>
                <Flex justify='between' gap='2'>
                    <Flex gap='2' align='center'>
                        <TextField.Root style={{ width: '360px' }}>
                            <TextField.Slot>
                                <BiSearch />
                            </TextField.Slot>
                            <TextField.Input
                                onChange={handleChange}
                                type='text'
                                placeholder='Search for file' />
                        </TextField.Root>
                        {debouncedText.length > 0 && debouncedText.length < 2 && <Text size='1' color="gray">Continue typing...</Text>}
                    </Flex>
                    <Flex justify='end' gap='2' align='center'>
                        <Sort
                            sortOrder={sortOrder}
                            onSortOrderChange={(order) => setSortOder(order)} />
                        <PageLengthSelector
                            options={[10, 20, 50, 100]}
                            selectedValue={selectedPageLength}
                            updateValue={(value) => setPageLength(value)} />
                        <PageSelector
                            rowsPerPage={selectedPageLength}
                            start={start}
                            totalRows={count!}
                            gotoNextPage={() => nextPage()}
                            gotoPreviousPage={() => previousPage()} />
                    </Flex>
                </Flex>

                <ErrorBanner error={error} />

                {!data && !error && <TableLoader columns={3} />}

                {data && data.message.length === 0 && (debouncedText.length >= 2 || debouncedText.length == 0) &&
                    <Flex align='center' justify='center' className="min-h-[32rem]">
                        <Text size='2' align='center'>No files found</Text>
                    </Flex>}

                {data && data.message.length !== 0 && <FilesTable data={data.message} />}

            </Flex>
        </div>
    )
}

export default ViewFilesContent