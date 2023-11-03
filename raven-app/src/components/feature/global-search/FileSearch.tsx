import { SearchIcon } from '@chakra-ui/icons'
import { Avatar, Button, Center, chakra, FormControl, HStack, Icon, Input, InputGroup, InputLeftElement, Link, Stack, TabPanel, Text, Image, Spinner, IconButton } from '@chakra-ui/react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useMemo, useState, useContext } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { useDebounce } from '../../../hooks/useDebounce'
import { GetFileSearchResult } from '../../../../../types/Search/Search'
import { getFileExtensionIcon } from '../../../utils/layout/fileExtensionIcon'
import { DateObjectToFormattedDateString, getFileExtension, getFileName } from '../../../utils/operations'
import { ErrorBanner } from '../../layout/AlertBanner'
import { EmptyStateForSearch } from '../../layout/EmptyState/EmptyState'
import { SelectInput, SelectOption } from '../search-filters/SelectInput'
import { Sort } from '../sorting'
import { AiOutlineFileExcel, AiOutlineFileImage, AiOutlineFilePdf, AiOutlineFilePpt, AiOutlineFileText } from 'react-icons/ai'
import './styles.css'
import { IoBookmark, IoBookmarkOutline } from 'react-icons/io5'
import { FilePreviewModal } from '../file-preview/FilePreviewModal'
import { useModalManager, ModalTypes } from "../../../hooks/useModalManager"
import { scrollbarStyles } from '../../../styles'
import { UserFields } from '@/utils/users/UserListProvider'
import { ChannelListContext, ChannelListContextType, ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'
import { useTheme } from '@/ThemeProvider'

interface FilterInput {
    'from-user-filter': SelectOption[],
    'date-filter': SelectOption,
    'channel-filter': SelectOption[],
    'my-channels-filter': boolean,
    'other-channels-filter': boolean,
    'with-user-filter': SelectOption[],
    'file-type-filter': SelectOption[],
    'saved-filter': boolean,
}

interface Props {
    onToggleMyChannels: () => void,
    isOpenMyChannels: boolean,
    dateOption: SelectOption[],
    input: string,
    fromFilter?: string,
    inFilter?: string
    onToggleSaved: () => void
    isSaved: boolean
}

export interface FileSearchResult {
    name: string,
    owner: string,
    creation: string,
    file: string,
    message_type: string
}

export const FileSearch = ({ onToggleMyChannels, isOpenMyChannels, onToggleSaved, isSaved, dateOption, input, fromFilter, inFilter }: Props) => {

    const { appearance } = useTheme()

    const users = useGetUserRecords()

    const userOptions: SelectOption[] = useMemo(() => {
        if (users) {
            return Object.values(users).map((user: UserFields) => ({
                value: user.name,
                label: <HStack><Avatar name={user.full_name} src={user.user_image ?? ''} borderRadius={'md'} size="xs" /><Text>{user.full_name}</Text></HStack>
            }))
        } else {
            return []
        }
    }, [users])

    const { channels } = useContext(ChannelListContext) as ChannelListContextType

    const channelOption: SelectOption[] = useMemo(() => {
        if (channels) {
            return channels.map((channel: ChannelListItem) => ({
                value: channel.name,
                label: <HStack>{channel.type === "Private" && <BiLockAlt /> || channel.type === "Public" && <BiHash /> || channel.type === "Open" && <BiGlobe />}<Text>{channel.channel_name}</Text></HStack>,
                is_archived: channel.is_archived
            }))
        } else {
            return []
        }
    }, [channels])

    const methods = useForm<FilterInput>({
        defaultValues: {
            'from-user-filter': userOptions && fromFilter ? [userOptions.find((option) => option.value == fromFilter)] : [],
            'channel-filter': channelOption && inFilter ? [channelOption.find((option) => option.value == inFilter)] : []
        }
    })
    const { watch, control } = methods
    const [searchText, setSearchText] = useState(input)
    const debouncedText = useDebounce(searchText, 50)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    const watchFileType = watch('file-type-filter')
    const watchChannel = watch('channel-filter')
    const watchFromUser = watch('from-user-filter')
    const watchDate = watch('date-filter')
    const watchMyChannels = watch('my-channels-filter')
    const watchSaved = watch('saved-filter')
    const file_type: string[] = useMemo(() => watchFileType ? watchFileType.map((fileType: SelectOption) => fileType.value) : [], [watchFileType]);
    const in_channel: string[] = watchChannel ? watchChannel.map((channel: SelectOption) => (channel.value)) : []
    const from_user: string[] = watchFromUser ? watchFromUser.map((user: SelectOption) => (user.value)) : []
    const date = watchDate ? watchDate.value : null
    const my_channel_only: boolean = watchMyChannels ? watchMyChannels : false
    const extensions: string[] = ['pdf', 'doc', 'ppt', 'xls']
    const saved: boolean = watchSaved ? watchSaved : false

    const message_type = useMemo(() => {
        const newMessageType = [];
        if (file_type.some(item => extensions.includes(item))) {
            newMessageType.push('File');
        }
        if (file_type.some(item => item === 'image')) {
            newMessageType.push('Image');
        }
        return newMessageType;
    }, [file_type, extensions]);


    const [sortOrder, setSortOrder] = useState("desc")
    const [sortByField, setSortByField] = useState<string>('creation')


    const { data, error, isLoading, isValidating } = useFrappeGetCall<{ message: GetFileSearchResult[] }>("raven.api.search.get_search_result", {
        filter_type: 'File',
        doctype: 'Raven Message',
        search_text: debouncedText,
        message_type: JSON.stringify(message_type),
        file_type: JSON.stringify(file_type),
        in_channel: JSON.stringify(in_channel),
        from_user: JSON.stringify(from_user),
        saved: saved,
        date: date,
        my_channel_only: my_channel_only,
        sort_order: sortOrder,
        sort_field: sortByField
    }, undefined, {
        revalidateOnFocus: false
    })

    const modalManager = useModalManager()

    return (
        <TabPanel px={0}>
            <Stack px={4}>
                <InputGroup>
                    <InputLeftElement
                        pointerEvents='none'
                        children={<SearchIcon color='gray.300' />} />
                    <Input
                        autoFocus
                        onChange={handleChange}
                        type='text'
                        placeholder='Search by file name or keyword'
                        value={debouncedText} />
                </InputGroup>
                <FormProvider {...methods}>
                    <chakra.form>
                        <HStack justifyContent={'space-between'}>
                            <FormControl id="from-user-filter" w='fit-content'>
                                <SelectInput placeholder="From" size='sm' options={userOptions} name='from-user-filter' defaultValue={userOptions.find((option) => option.value == fromFilter)} isMulti={true} chakraStyles={{
                                    multiValue: (chakraStyles) => ({ ...chakraStyles, display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '0rem 0.2rem 0rem 0rem' })
                                }} />
                            </FormControl>
                            <FormControl id="channel-filter" w='fit-content'>
                                <SelectInput placeholder="In" size='sm' options={channelOption} name='channel-filter' defaultValue={channelOption.find((option) => option.value == inFilter)} isMulti={true} />
                            </FormControl>
                            <FormControl id="date-filter" w='fit-content'>
                                <SelectInput placeholder="Date" size='sm' options={dateOption} name='date-filter' isClearable={true} />
                            </FormControl>
                            <FormControl id="file-type-filter" w='fit-content'>
                                <SelectInput placeholder="File type" size='sm' options={fileOption} name='file-type-filter' isMulti={true} />
                            </FormControl>
                            <FormControl id="my-channels-filter" w='fit-content'>
                                <Controller
                                    name="my-channels-filter"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Button
                                            borderRadius={3}
                                            size="sm"
                                            w="fit-content"
                                            isActive={value = isOpenMyChannels}
                                            onClick={() => {
                                                onToggleMyChannels()
                                                onChange(!value)
                                            }}
                                            _active={{
                                                border: "2px solid #3182CE"
                                            }}
                                        >
                                            Only in my channels
                                        </Button>
                                    )}
                                />
                            </FormControl>
                            <FormControl id="saved-filter" w='fit-content'>
                                <Controller
                                    name="saved-filter"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <IconButton
                                            aria-label="saved-filter"
                                            icon={isSaved ? <IoBookmark /> : <IoBookmarkOutline />}
                                            borderRadius={3}
                                            size="sm"
                                            w="fit-content"
                                            isActive={value = isSaved}
                                            onClick={() => {
                                                onToggleSaved()
                                                onChange(!value)
                                            }}
                                            _active={{
                                                border: "2px solid #3182CE"
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </HStack>
                    </chakra.form>
                </FormProvider>
            </Stack>
            <Stack h='420px' p={4}>
                <ErrorBanner error={error} />
                {
                    (isLoading && isValidating ? <Center><Spinner /></Center> :
                        (!!!error && data?.message && data.message.length > 0 ?
                            <><Sort
                                sortingFields={[{ label: 'Created on', field: 'creation' }]}
                                onSortFieldSelect={(selField) => setSortByField(selField)}
                                sortOrder={sortOrder}
                                sortField={sortByField}
                                onSortOrderChange={(order) => setSortOrder(order)} />
                                <Stack spacing={4} overflowY='scroll' sx={scrollbarStyles(appearance)}>

                                    {data.message.map((f: FileSearchResult) => {
                                        const onFilePreviewModalOpen = () => {
                                            modalManager.openModal(ModalTypes.FilePreview, {
                                                file: f.file,
                                                owner: f.owner,
                                                creation: f.creation,
                                                message_type: f.message_type
                                            })
                                        }
                                        return (
                                            <HStack spacing={3} key={f.name}>
                                                <Center maxW='50px'>
                                                    {f.message_type === 'File' && <Icon as={getFileExtensionIcon(getFileExtension(f.file))} boxSize="9" />}
                                                    {f.message_type === 'Image' && <Image src={f.file} alt='File preview' boxSize={'36px'} rounded='md' fit='cover' />}
                                                </Center>
                                                <Stack spacing={0}>
                                                    {f.file && <Text fontSize='sm' as={Link} href={f.file} isExternal>{getFileName(f.file)}</Text>}
                                                    {users && <Text fontSize='xs' color='gray.500'>Shared by {Object.values(users).find((user: UserFields) => user.name === f.owner)?.full_name} on {DateObjectToFormattedDateString(new Date(f.creation ?? ''))}</Text>}
                                                </Stack>
                                            </HStack>
                                        )
                                    })}
                                </Stack></> : <EmptyStateForSearch />))}
            </Stack>
            <FilePreviewModal
                isOpen={modalManager.modalType === ModalTypes.FilePreview}
                onClose={modalManager.closeModal}
                {...modalManager.modalContent}
            />
        </TabPanel>
    )
}

const fileOption: SelectOption[] = [
    { label: <HStack><div className="icon-container"><AiOutlineFilePdf /></div><Text>PDFs</Text></HStack>, value: "pdf" },
    { label: <HStack><div className="icon-container"><AiOutlineFileText /></div><Text>Documents</Text></HStack>, value: "doc" },
    { label: <HStack><div className="icon-container"><AiOutlineFilePpt /></div><Text>Presentations</Text></HStack>, value: "ppt" },
    { label: <HStack><div className="icon-container"><AiOutlineFileExcel /></div><Text>Spreadsheets</Text></HStack>, value: "xls" },
    { label: <HStack><div className="icon-container"><AiOutlineFileImage /></div><Text>Image</Text></HStack>, value: "image" }
]