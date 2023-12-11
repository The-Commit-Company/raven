import { BiSearch } from 'react-icons/bi'
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { useContext, useState, useMemo } from 'react'
import { useDebounce } from '../../../hooks/useDebounce'
import { GetMessageSearchResult } from '../../../../../types/Search/Search'
import { ErrorBanner } from '../../layout/AlertBanner'
import { EmptyStateForSearch } from '../../layout/EmptyState/EmptyState'
import { useNavigate } from 'react-router-dom'
import { MessageBox } from './MessageBox'
import { VirtuosoRefContext } from '../../../utils/message/VirtuosoRefProvider'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'
import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { useToast } from '@/hooks/useToast'
import { Box, Checkbox, Flex, Select, TextField, Text, Grid, ScrollArea } from '@radix-ui/themes'
import { UserAvatar } from '@/components/common/UserAvatar'
import { dateOption } from './GlobalSearch'
import { Loader } from '@/components/common/Loader'

interface Props {
    onToggleMyChannels: () => void,
    isOpenMyChannels: boolean,
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

export const MessageSearch = ({ onToggleMyChannels, isOpenMyChannels, onToggleSaved, isSaved, input, fromFilter, inFilter, withFilter, onClose, onCommandPaletteClose }: Props) => {

    const [searchText, setSearchText] = useState(input)
    const debouncedText = useDebounce(searchText)

    const { channels, dm_channels } = useContext(ChannelListContext) as ChannelListContextType

    const [userFilter, setUserFilter] = useState<string | undefined>(fromFilter)

    // By default, use the "In filter" to set the channel filter. If the "In filter" is not set, use the "With filter" to set the channel filter.
    const [channelFilter, setChannelFilter] = useState<string | undefined>(inFilter ? inFilter : dm_channels.find(c => c.peer_user_id == withFilter)?.name)

    const [dateFilter, setDateFilter] = useState<string | undefined>()

    const { virtuosoRef } = useContext(VirtuosoRefContext)
    const navigate = useNavigate()

    const { call, reset } = useFrappePostCall<{ message: string }>("raven.raven_messaging.doctype.raven_message.raven_message.get_index_of_message")

    const handleNavigateToChannel = (channelID: string) => {
        onClose()
        onCommandPaletteClose()
        navigate(`/channel/${channelID}`)
    }

    const { toast } = useToast()

    const handleScrollToMessage = async (messageName: string, channelID: string) => {
        reset()
        handleNavigateToChannel(channelID)
        const result = call({
            channel_id: channelID,
            message_id: messageName
        }).then((result) => {
            if (virtuosoRef) {
                virtuosoRef.current?.scrollToIndex({ index: parseInt(result.message) ?? 'LAST', align: 'center' })
            }
        }).catch(() => {
            toast({
                description: "There was an error while indexing the message.",
                duration: 1000,
                variant: "destructive"
            })
        })

    }

    const users = useGetUserRecords()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }


    const showResults = useMemo(() => {
        const isChannelFilterApplied = channelFilter !== 'any' && channelFilter !== undefined
        const isUserFilterApplied = userFilter !== 'any' && userFilter !== undefined
        const isDateFilterApplied = dateFilter !== 'any' && dateFilter !== undefined
        return (debouncedText.length > 2 || isChannelFilterApplied || isUserFilterApplied || isDateFilterApplied || isOpenMyChannels === true)
    }, [debouncedText, channelFilter, userFilter, isOpenMyChannels, dateFilter])

    const { data, error, isLoading } = useFrappeGetCall<{ message: GetMessageSearchResult[] }>("raven.api.search.get_search_result", {
        filter_type: 'Message',
        doctype: 'Raven Message',
        search_text: debouncedText,
        in_channel: channelFilter === 'any' ? undefined : channelFilter,
        from_user: userFilter === 'any' ? undefined : userFilter,
        date: dateFilter === 'any' ? undefined : dateFilter,
        my_channel_only: isOpenMyChannels,
        saved: isSaved,
    }, showResults ? undefined : null, {
        revalidateOnFocus: false,
    })

    return (
        <Box>
            <Flex direction='column' gap='2'>
                <TextField.Root>
                    <TextField.Slot>
                        <BiSearch />
                    </TextField.Slot>
                    <TextField.Input
                        onChange={handleChange}
                        type='text'
                        placeholder='Search messages'
                        value={searchText}
                        autoFocus />
                    <TextField.Slot>
                        {isLoading && <Loader />}
                    </TextField.Slot>
                </TextField.Root>
                <Grid
                    gap='2'
                    justify="between"
                    columns='5'
                    align='center'>
                    <Select.Root value={userFilter} onValueChange={setUserFilter}>
                        <Select.Trigger placeholder='From' id='from-filter' />
                        <Select.Content>
                            <Select.Item value='any'>From anyone</Select.Item>
                            <Select.Group>
                                <Select.Label>Message from</Select.Label>
                                {Object.values(users).map((option) => <Select.Item
                                    key={option.name}
                                    textValue={option.full_name}
                                    value={option.name}>
                                    <Flex gap="2" align='center'>
                                        <UserAvatar src={option.user_image} alt={option.full_name} />
                                        <Text>{option.full_name}</Text>
                                    </Flex>
                                </Select.Item>)}
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>

                    <Select.Root value={channelFilter} onValueChange={setChannelFilter}>
                        <Select.Trigger placeholder='Channel / DM' />
                        <Select.Content>
                            <Select.Item value='any'>Any channel</Select.Item>
                            <Select.Group>
                                <Select.Label>Channels</Select.Label>
                                {channels.map(option => <Select.Item key={option.name} value={option.name}>
                                    <Flex gap="2" align='center' className='overflow-hidden'>
                                        <ChannelIcon type={option.type} />
                                        <Text style={{
                                            maxWidth: '20ch'
                                        }} className='text-ellipsis whitespace-break-spaces line-clamp-1'>{option.channel_name}</Text>
                                    </Flex>
                                </Select.Item>)}
                            </Select.Group>
                            <Select.Separator />
                            <Select.Group>
                                <Select.Label>Direct Messages</Select.Label>
                                {dm_channels.map(option => <Select.Item
                                    key={option.name}
                                    value={option.name}
                                    textValue={users[option.peer_user_id]?.full_name ?? option.peer_user_id}>

                                    <Flex gap="2" align='center'>
                                        <UserAvatar src={users[option.peer_user_id]?.user_image} alt={users[option.peer_user_id]?.full_name ?? option.peer_user_id} />
                                        <Text>{users[option.peer_user_id]?.full_name ?? option.peer_user_id}</Text>
                                    </Flex>
                                </Select.Item>)}

                            </Select.Group>
                        </Select.Content>
                    </Select.Root>

                    <Select.Root value={dateFilter} onValueChange={setDateFilter}>
                        <Select.Trigger placeholder='Date' />
                        <Select.Content>
                            <Select.Group>
                                <Select.Label>Date</Select.Label>
                                <Select.Item value='any'>Any time</Select.Item>
                                {dateOption.map((option) => <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>)}
                            </Select.Group>

                        </Select.Content>
                    </Select.Root>

                    <Text as="label" size="2">
                        <Flex gap="2">
                            <Checkbox checked={isOpenMyChannels} onCheckedChange={onToggleMyChannels} /> Only in my channels
                        </Flex>
                    </Text>

                    <Text as="label" size="2">
                        <Flex gap="2">
                            <Checkbox checked={isSaved} onCheckedChange={onToggleSaved} /> Saved
                        </Flex>
                    </Text>
                </Grid>
            </Flex>
            <ScrollArea type="always" scrollbars="vertical" style={{ height: 420 }} mt='4'>
                <ErrorBanner error={error} />
                {data?.message?.length === 0 && <EmptyStateForSearch />}
                {data?.message?.length && data?.message.length > 0 ? <Flex direction='column' gap='2'>
                    {data.message.map((message: MessageSearchResult) => {
                        return (
                            <MessageBox message={{
                                ...message,
                                message_type: 'Text',
                                is_continuation: 0,
                                is_reply: 0,
                                _liked_by: '[]',
                            }} handleScrollToMessage={handleScrollToMessage} />
                        )
                    })}
                </Flex> : !showResults && <Box className='text-center' py='8'>
                    <Text size='2' className='text-gray-11'>Add a search query above to see results.</Text>
                </Box>}
            </ScrollArea>
        </Box>
    )
}