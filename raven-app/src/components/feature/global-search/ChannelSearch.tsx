import { SearchIcon } from '@chakra-ui/icons'
import { Button, Center, chakra, FormControl, HStack, Input, InputGroup, InputLeftElement, Text, Stack, TabPanel, Box, useColorMode } from '@chakra-ui/react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useState } from 'react'
import { FormProvider, Controller, useForm } from 'react-hook-form'
import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../../../hooks/useDebounce'
import { GetChannelSearchResult } from '../../../types/Search/Search'
import { AlertBanner } from '../../layout/AlertBanner'
import { EmptyStateForSearch } from '../../layout/EmptyState/EmptyState'
import { FullPageLoader } from '../../layout/Loaders'
import { SelectInput, SelectOption } from '../search-filters/SelectInput'
import { Sort } from '../sorting'
interface Props {
    onToggleMyChannels: () => void,
    isOpenMyChannels: boolean,
    onToggleOtherChannels: () => void,
    isOpenOtherChannels: boolean,
    input: string,
    onClose: () => void
}

export const ChannelSearch = ({ onToggleMyChannels, isOpenMyChannels, onToggleOtherChannels, isOpenOtherChannels, input, onClose }: Props) => {
    const methods = useForm()
    const { watch, control } = methods
    const [searchText, setSearchText] = useState(input)
    const debouncedText = useDebounce(searchText, 50)
    const watchChannelType = watch('channel-type-filter')
    const channel_type: string[] = watchChannelType ? watchChannelType.map((type: { value: string, label: string }) => (type.value)) : []
    const watchMyChannels = watch('my-channels-filter')
    const my_channel_only: boolean = watchMyChannels ? watchMyChannels : null
    const watchOtherChannels = watch('other-channels-filter')
    const other_channel_only: boolean = watchOtherChannels ? watchOtherChannels : null

    const [sortOrder, setSortOrder] = useState("desc")
    const [sortByField, setSortByField] = useState<string>('creation')
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    const { colorMode } = useColorMode()

    const { data, error, isLoading, isValidating } = useFrappeGetCall<{ message: GetChannelSearchResult[] }>("raven.api.search.get_search_result", {
        filter_type: 'Channel',
        doctype: 'Raven Channel',
        search_text: debouncedText,
        channel_type: JSON.stringify(channel_type),
        my_channel_only: my_channel_only,
        other_channel_only: other_channel_only,
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
                        placeholder='Search channels'
                        value={debouncedText} />
                </InputGroup>
                <FormProvider {...methods}>
                    <chakra.form>
                        <HStack>
                            <FormControl id="channel-type-filter" w='fit-content'>
                                <SelectInput placeholder="Channel Type" size='sm' options={channelOption} name='channel-type-filter' isClearable={true} isMulti={true} />
                            </FormControl>
                            <FormControl id="other-channels-filter" w='fit-content'>
                                <Controller
                                    name="other-channels-filter"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Button
                                            borderRadius={3}
                                            size="sm"
                                            w="fit-content"
                                            isActive={value = isOpenOtherChannels}
                                            onClick={() => {
                                                onToggleOtherChannels()
                                                onChange(!value)
                                            }}
                                            _active={{
                                                border: "2px solid #3182CE"
                                            }}
                                        >
                                            Exclude the channels that I'm in
                                        </Button>
                                    )}
                                />
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
                </FormProvider>
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
                                <Stack spacing={2} overflowY='scroll'>

                                    {data.message.map((channel) => {
                                        return (
                                            <Box p={2}
                                                _hover={{
                                                    bg: colorMode === 'light' && 'gray.50' || 'gray.800',
                                                    borderRadius: 'md'
                                                }}
                                                rounded='md'
                                                onClick={() => {
                                                    navigate(`/channel/${channel.name}`)
                                                    onClose()
                                                }}>
                                                <HStack spacing={3}>
                                                    <Center maxW='50px'>
                                                        {channel.type === "Private" && <BiLockAlt /> || channel.type === "Public" && <BiHash /> || channel.type === "Open" && <BiGlobe />}
                                                    </Center>
                                                    <HStack spacing={1}>
                                                        <Text>{channel.channel_name}</Text>
                                                        {channel.is_archived && <Text>(archived)</Text>}
                                                    </HStack>
                                                </HStack>
                                            </Box>
                                        )
                                    }
                                    )}
                                </Stack></> : <EmptyStateForSearch />))}
            </Stack>
        </TabPanel>
    )
}

const channelOption: SelectOption[] = [
    { label: <HStack><div className="icon-container"><BiLockAlt /></div><Text>Private</Text></HStack>, value: "Private" },
    { label: <HStack><div className="icon-container"><BiHash /></div><Text>Public</Text></HStack>, value: "Public" },
    { label: <HStack><div className="icon-container"><BiGlobe /></div><Text>Open</Text></HStack>, value: "Open" }
]