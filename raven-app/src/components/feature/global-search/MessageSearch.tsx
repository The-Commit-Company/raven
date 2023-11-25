import { Bookmark, BookmarkCheck, Search } from 'lucide-react'
import { Avatar, Button, Center, chakra, FormControl, HStack, IconButton, Input, InputGroup, InputLeftElement, Spinner, Stack, TabPanel, Text } from '@chakra-ui/react'
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { useContext, useState, useMemo, useEffect } from 'react'
import { FormProvider, Controller, useForm } from 'react-hook-form'
import { useDebounce } from '../../../hooks/useDebounce'
import { GetMessageSearchResult } from '../../../../../types/Search/Search'
import { ErrorBanner } from '../../layout/AlertBanner'
import { EmptyStateForSearch } from '../../layout/EmptyState/EmptyState'
import { SelectInput, SelectOption } from '../search-filters/SelectInput'
import { Sort } from '../sorting'
import { useNavigate } from 'react-router-dom'
import { MessageBox } from './MessageBox'
import { VirtuosoRefContext } from '../../../utils/message/VirtuosoRefProvider'
import { scrollbarStyles } from '../../../styles'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'
import { UserFields } from '@/utils/users/UserListProvider'
import { ChannelListContext, ChannelListContextType, ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { useTheme } from '@/ThemeProvider'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { useToast } from '@/hooks/useToast'

interface FilterInput {
    'from-user-filter': SelectOption[],
    'date-filter': SelectOption,
    'channel-filter': SelectOption[],
    'my-channels-filter': boolean,
    'other-channels-filter': boolean,
    'with-user-filter': SelectOption[],
    'saved-filter': boolean,
}
interface Props {
    onToggleMyChannels: () => void,
    isOpenMyChannels: boolean,
    dateOption: SelectOption[],
    input: string,
    fromFilter?: string,
    inFilter?: string,
    withFilter?: string,
    onCommandPaletteClose: () => void
    onClose: () => void
    onToggleSaved: () => void
    isSaved: boolean
}

interface MessageSearchResult {
    channel_id: string
    name: string,
    owner: string,
    creation: string,
    text: string,
}

export const MessageSearch = ({ onToggleMyChannels, isOpenMyChannels, onToggleSaved, isSaved, dateOption, input, fromFilter, inFilter, withFilter, onClose, onCommandPaletteClose }: Props) => {

    const { appearance } = useTheme()

    const { virtuosoRef } = useContext(VirtuosoRefContext)
    const navigate = useNavigate()
    const { call, error: indexingError, loading, reset } = useFrappePostCall<{ message: string }>("raven.raven_messaging.doctype.raven_message.raven_message.get_index_of_message")

    const handleNavigateToChannel = (channelID: string, _callback: VoidFunction) => {
        onClose()
        onCommandPaletteClose()
        navigate(`/channel/${channelID}`)
        _callback()
    }

    const handleScrollToMessage = (messageName: string, channelID: string) => {
        reset()
        handleNavigateToChannel(channelID, async function () {
            const result = await call({
                channel_id: channelID,
                message_id: messageName
            })
            if (virtuosoRef) {
                virtuosoRef.current?.scrollToIndex({ index: parseInt(result.message) ?? 'LAST', align: 'center' })
            }
        })
    }

    const { toast } = useToast()

    if (indexingError) {
        toast({
            description: "There was an error while indexing the message.",
            duration: 1000,
            variant: "destructive"
        })
    }

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
                label: <HStack><ChannelIcon type={channel.type} /><Text>{channel.channel_name}</Text></HStack>,
                is_archived: channel.is_archived
            }))
        } else {
            return []
        }
    }, [channels])

    const methods = useForm<FilterInput>({
        defaultValues: {
            'from-user-filter': userOptions && fromFilter ? [userOptions.find((option) => option.value == fromFilter)] : [],
            'channel-filter': channelOption && inFilter ? [channelOption.find((option) => option.value == inFilter)] : [],
            'with-user-filter': userOptions && withFilter ? [userOptions.find((option) => option.value == withFilter)] : []
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
    const watchSaved = watch('saved-filter')
    const in_channel: string[] = watchChannel ? watchChannel.map((channel: SelectOption) => (channel.value)) : []
    const from_user: string[] = watchFromUser ? watchFromUser.map((user: SelectOption) => (user.value)) : []
    const with_user: string[] = watchWithUser ? watchWithUser.map((user: SelectOption) => (user.value)) : []
    const date = watchDate ? watchDate.value : null
    const my_channel_only: boolean = watchMyChannels ? watchMyChannels : false
    const saved: boolean = watchSaved ? watchSaved : false

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
        saved: saved,
        sort_order: sortOrder,
        sort_field: sortByField
    }, undefined, {
        revalidateOnFocus: false
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
                        children={<Search color='gray.300' />} />
                    <Input
                        autoFocus
                        onChange={handleChange}
                        type='text'
                        placeholder='Search messages'
                        value={debouncedText} />
                </InputGroup>
                <FormProvider {...methods}>
                    <chakra.form>
                        <HStack justifyContent="space-between">
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
                                            icon={isSaved ? <BookmarkCheck /> : <Bookmark />}
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
                    ((isLoading && isValidating) || loading ? <Center><Spinner /></Center> :
                        (data?.message && data.message.length > 0 && showResults ?
                            <><Sort
                                sortingFields={[{ label: 'Created on', field: 'creation' }]}
                                onSortFieldSelect={(selField) => setSortByField(selField)}
                                sortOrder={sortOrder}
                                sortField={sortByField}
                                onSortOrderChange={(order) => setSortOrder(order)} />
                                <Stack overflowY='scroll' pt={4} sx={scrollbarStyles(appearance)}>
                                    {data.message.map(({ name, text, owner, creation, channel_id }: MessageSearchResult) => {
                                        return (
                                            <MessageBox messageName={name} channelID={channel_id} creation={creation} owner={owner} messageText={text} handleScrollToMessage={handleScrollToMessage} message_type={'Text'} />
                                        )
                                    })}
                                </Stack></> : <EmptyStateForSearch />))}
            </Stack>
        </TabPanel>
    )
}