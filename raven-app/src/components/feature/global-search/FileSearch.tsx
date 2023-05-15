import { SearchIcon } from '@chakra-ui/icons'
import { Avatar, Button, Center, chakra, FormControl, HStack, Icon, Input, InputGroup, InputLeftElement, Link, Stack, TabPanel, Text, Image } from '@chakra-ui/react'
import { FrappeConfig, FrappeContext, useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import { useMemo, useState, useContext } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { useDebounce } from '../../../hooks/useDebounce'
import { ChannelData } from '../../../types/Channel/Channel'
import { GetFileSearchResult } from '../../../types/Search/Search'
import { User } from '../../../types/User/User'
import { getFileExtensionIcon } from '../../../utils/layout/fileExtensionIcon'
import { DateObjectToFormattedDateString } from '../../../utils/operations'
import { AlertBanner } from '../../layout/AlertBanner'
import { EmptyStateForSearch } from '../../layout/EmptyState/EmptyState'
import { FullPageLoader } from '../../layout/Loaders'
import { SelectInput, SelectOption } from '../search-filters/SelectInput'
import { Sort } from '../sorting'
import { AiOutlineFileExcel, AiOutlineFileImage, AiOutlineFilePdf, AiOutlineFilePpt, AiOutlineFileText } from 'react-icons/ai'
import './styles.css'

interface FilterInput {
    'from-user-filter': SelectOption[],
    'date-filter': SelectOption,
    'channel-filter': SelectOption[],
    'my-channels-filter': boolean,
    'other-channels-filter': boolean,
    'with-user-filter': SelectOption[],
    'file-type-filter': SelectOption[],
}

interface Props {
    onToggleMyChannels: () => void,
    isOpenMyChannels: boolean,
    dateOption: SelectOption[],
    input: string,
    fromFilter?: string,
    inFilter?: string
}

export const FileSearch = ({ onToggleMyChannels, isOpenMyChannels, dateOption, input, fromFilter, inFilter }: Props) => {

    const { url } = useContext(FrappeContext) as FrappeConfig
    const { data: channels, error: channelsError } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")

    const { data: users, error: usersError } = useFrappeGetDocList<User>("User", {
        fields: ["full_name", "user_image", "name"],
        filters: [["name", "!=", "Guest"]]
    })

    const userOptions: SelectOption[] = useMemo(() => {
        if (users) {
            return users.map((user: User) => ({
                value: user.name,
                label: <HStack><Avatar name={user.full_name} src={url + user.user_image} borderRadius={'md'} size="xs" /><Text>{user.full_name}</Text></HStack>
            }))
        } else {
            return []
        }
    }, [users])

    const channelOption: SelectOption[] = useMemo(() => {
        if (channels) {
            return channels.message.map((channel: ChannelData) => ({
                value: channel.name,
                label: <HStack>{channel.type === "Private" && <BiLockAlt /> || channel.type === "Public" && <BiHash /> || channel.type === "Open" && <BiGlobe />}<Text>{channel.channel_name}</Text></HStack>
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
    const file_type: string[] = useMemo(() => watchFileType ? watchFileType.map((fileType: SelectOption) => fileType.value) : [], [watchFileType]);
    const in_channel: string[] = watchChannel ? watchChannel.map((channel: SelectOption) => (channel.value)) : []
    const from_user: string[] = watchFromUser ? watchFromUser.map((user: SelectOption) => (user.value)) : []
    const date = watchDate ? watchDate.value : null
    const my_channel_only: boolean = watchMyChannels ? watchMyChannels : false
    const extensions: string[] = ['pdf', 'doc', 'ppt', 'xls']

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
        date: date,
        my_channel_only: my_channel_only,
        sort_order: sortOrder,
        sort_field: sortByField
    })

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
                {!!!usersError && !!!channelsError &&
                    <FormProvider {...methods}>
                        <chakra.form>
                            <HStack justifyContent={'space-between'}>
                                <FormControl id="from-user-filter" w='fit-content'>
                                    <SelectInput placeholder="From" size='sm' options={userOptions} name='from-user-filter' defaultValue={userOptions.find((option) => option.value == fromFilter)} isMulti={true} chakraStyles={{
                                        multiValue: (chakraStyles) => ({ ...chakraStyles, display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '0rem 0.2rem 0rem 0rem' }),
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
                                                Only my channels
                                            </Button>
                                        )}
                                    />
                                </FormControl>
                            </HStack>
                        </chakra.form>
                    </FormProvider>}
            </Stack>
            <Stack h='420px' p={4}>

                {error ? <AlertBanner status='error' heading={error.message}>{error.httpStatus} - {error.httpStatusText}</AlertBanner> :
                    (isLoading && isValidating ? <FullPageLoader /> :
                        (!!!error && data?.message && data.message.length > 0 ?
                            <><Sort
                                sortingFields={[{ label: 'Created on', field: 'creation' }]}
                                onSortFieldSelect={(selField) => setSortByField(selField)}
                                sortOrder={sortOrder}
                                sortField={sortByField}
                                onSortOrderChange={(order) => setSortOrder(order)} />
                                <Stack spacing={4} overflowY='scroll'>

                                    {data.message.map((f) => {
                                        return (
                                            f.message_type != 'Text' &&
                                            <HStack spacing={3}>
                                                <Center maxW='50px'>
                                                    {f.message_type === 'File' && <Icon as={getFileExtensionIcon(f.file.split('.')[1])} boxSize="9" />}
                                                    {f.message_type === 'Image' && <Image src={f.file} alt='File preview' boxSize={'36px'} rounded='md' fit='cover' />}
                                                </Center>
                                                <Stack spacing={0}>
                                                    {f.file && <Text fontSize='sm' as={Link} href={f.file} isExternal>{f.file.split('/')[3]}</Text>}
                                                    {users && <Text fontSize='xs' color='gray.500'>Shared by {users.find((user) => user.name === f.owner)?.full_name} on {DateObjectToFormattedDateString(new Date(f.creation ?? ''))}</Text>}
                                                </Stack>
                                            </HStack>
                                        )
                                    }
                                    )}
                                </Stack></> : <EmptyStateForSearch />))}
            </Stack>
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