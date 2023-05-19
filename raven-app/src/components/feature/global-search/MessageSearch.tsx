import { SearchIcon } from '@chakra-ui/icons'
import { Avatar, Button, chakra, FormControl, HStack, Input, InputGroup, InputLeftElement, Stack, TabPanel, Text } from '@chakra-ui/react'
import { FrappeContext, FrappeConfig, useFrappeGetCall } from 'frappe-react-sdk'
import { useContext, useState, useMemo, useEffect } from 'react'
import { FormProvider, Controller, useForm } from 'react-hook-form'
import { BiLockAlt, BiHash, BiGlobe } from 'react-icons/bi'
import { useDebounce } from '../../../hooks/useDebounce'
import { ChannelData } from '../../../types/Channel/Channel'
import { GetMessageSearchResult } from '../../../types/Search/Search'
import { User } from '../../../types/User/User'
import { AlertBanner } from '../../layout/AlertBanner'
import { EmptyStateForSearch } from '../../layout/EmptyState/EmptyState'
import { FullPageLoader } from '../../layout/Loaders'
import { SelectInput, SelectOption } from '../search-filters/SelectInput'
import { Sort } from '../sorting'
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { ChatMessageBox } from '../chat'
import { MarkdownRenderer } from '../markdown-viewer/MarkdownRenderer'

interface FilterInput {
    'from-user-filter': SelectOption[],
    'date-filter': SelectOption,
    'channel-filter': SelectOption[],
    'my-channels-filter': boolean,
    'other-channels-filter': boolean,
    'with-user-filter': SelectOption[],
}
interface Props {
    onToggleMyChannels: () => void,
    isOpenMyChannels: boolean,
    dateOption: SelectOption[],
    input: string,
    fromFilter?: string,
    inFilter?: string
}

export const MessageSearch = ({ onToggleMyChannels, isOpenMyChannels, dateOption, input, fromFilter, inFilter }: Props) => {

    const { url } = useContext(FrappeContext) as FrappeConfig
    const { users } = useContext(ChannelContext)

    const { data: channels, error: channelsError } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")

    const userOptions: SelectOption[] = useMemo(() => {
        if (users) {
            return Object.values(users).map((user: User) => ({
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

    const watchChannel = watch('channel-filter')
    const watchFromUser = watch('from-user-filter')
    const watchDate = watch('date-filter')
    const watchMyChannels = watch('my-channels-filter')
    const watchWithUser = watch('with-user-filter')
    const in_channel: string[] = watchChannel ? watchChannel.map((channel: SelectOption) => (channel.value)) : []
    const from_user: string[] = watchFromUser ? watchFromUser.map((user: SelectOption) => (user.value)) : []
    const with_user: string[] = watchWithUser ? watchWithUser.map((user: SelectOption) => (user.value)) : []
    const date = watchDate ? watchDate.value : null
    const my_channel_only: boolean = watchMyChannels ? watchMyChannels : false

    const [sortOrder, setSortOrder] = useState("desc")
    const [sortByField, setSortByField] = useState<string>('creation')
    const [showResults, setShowResults] = useState<boolean>(false)

    const { data, error, isLoading, isValidating } = useFrappeGetCall<{ message: GetMessageSearchResult[] }>("raven.api.search.get_search_result", {
        filter_type: 'Message',
        doctype: 'Raven Message',
        search_text: debouncedText,
        in_channel: JSON.stringify(in_channel),
        from_user: JSON.stringify(from_user),
        with_user: JSON.stringify(with_user),
        date: date,
        my_channel_only: my_channel_only,
        sort_order: sortOrder,
        sort_field: sortByField
    })

    useEffect(() => {
        setShowResults(debouncedText.length > 2 || in_channel?.length > 0 || from_user?.length > 0 || with_user?.length > 0 || date !== null || my_channel_only === true)
    }, [debouncedText, in_channel, from_user, with_user, date, my_channel_only])

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
                        placeholder='Search messages'
                        value={debouncedText} />
                </InputGroup>
                {!!!channelsError &&
                    <FormProvider {...methods}>
                        <chakra.form>
                            <HStack>
                                <FormControl id="from-user-filter" w='fit-content'>
                                    <SelectInput placeholder="From" size='sm' options={userOptions} name='from-user-filter' isMulti={true} chakraStyles={{
                                        multiValue: (chakraStyles) => ({ ...chakraStyles, display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '0rem 0.2rem 0rem 0rem' }),
                                    }} />
                                </FormControl>
                                <FormControl id="channel-filter" w='fit-content'>
                                    <SelectInput placeholder="In" size='sm' options={channelOption} name='channel-filter' isMulti={true} defaultValue={channelOption.find((option) => option.value == inFilter)} />
                                </FormControl>
                                <FormControl id="with-user-filter" w="fit-content">
                                    <SelectInput placeholder="With" size='sm' options={userOptions} name='with-user-filter' isMulti={true} chakraStyles={{
                                        multiValue: (chakraStyles) => ({ ...chakraStyles, display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '0rem 0.2rem 0rem 0rem' }),
                                    }} />
                                </FormControl>
                                <FormControl id="date-filter" w='fit-content'>
                                    <SelectInput placeholder="Date" size='sm' options={dateOption} name='date-filter' isClearable={true} />
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
                        (!!!error && data?.message && data.message.length > 0 && showResults ?
                            <><Sort
                                sortingFields={[{ label: 'Created on', field: 'creation' }]}
                                onSortFieldSelect={(selField) => setSortByField(selField)}
                                sortOrder={sortOrder}
                                sortField={sortByField}
                                onSortOrderChange={(order) => setSortOrder(order)} />
                                <Stack overflowY='scroll' pt={4}>
                                    {data.message.map(({ name, text, owner, creation, channel_id }) => {
                                        const channelName: any = channelOption.find((channel) => channel.value === channel_id)?.label
                                        const isArchived: number = channelOption.find((channel) => channel.value === channel_id)?.is_archived as number
                                        return (
                                            <ChatMessageBox
                                                key={name}
                                                message={{
                                                    name: name,
                                                    text: text,
                                                    file: null,
                                                    message_type: 'Text',
                                                    owner: owner,
                                                    creation: creation
                                                }}
                                                isSearchResult={true}
                                                isArchived={isArchived}
                                                channelName={channelName}
                                                channelID={channel_id}
                                                py={1}
                                                zIndex={0}
                                            >
                                                {text && <MarkdownRenderer content={text} />}
                                            </ChatMessageBox>
                                        )
                                    }
                                    )}
                                </Stack></> : <EmptyStateForSearch />))}
            </Stack>
        </TabPanel>
    )
}