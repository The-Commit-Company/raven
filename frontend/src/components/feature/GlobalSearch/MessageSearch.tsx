import { BiSearch } from 'react-icons/bi'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useContext, useState, useMemo } from 'react'
import { useDebounce } from '../../../hooks/useDebounce'
import { ErrorBanner } from '../../layout/AlertBanner/ErrorBanner'
import { EmptyStateForSearch } from '../../layout/EmptyState/EmptyState'
import { useNavigate } from 'react-router-dom'
import { MessageBox } from './MessageBox'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'
import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { Box, Checkbox, Flex, Select, TextField, Text, Grid, ScrollArea } from '@radix-ui/themes'
import { UserAvatar } from '@/components/common/UserAvatar'
import { dateOption } from './GlobalSearch'
import { Loader } from '@/components/common/Loader'
import { Message } from '../../../../../types/Messaging/Message'

interface Props {
    onToggleMyChannels: () => void,
    isOnlyInMyChannels: boolean,
    input: string,
    fromFilter?: string,
    inFilter?: string,
    withFilter?: string,
    onClose: () => void
    onToggleSaved: () => void
    isSaved: boolean
}

export const MessageSearch = ({ onToggleMyChannels, isOnlyInMyChannels, onToggleSaved, isSaved, input, fromFilter, inFilter, withFilter, onClose }: Props) => {

    const [searchText, setSearchText] = useState(input)
    const debouncedText = useDebounce(searchText)

    const { channels, dm_channels } = useContext(ChannelListContext) as ChannelListContextType

    const [userFilter, setUserFilter] = useState<string | undefined>(fromFilter)

    // By default, use the "In filter" to set the channel filter. If the "In filter" is not set, use the "With filter" to set the channel filter.
    const [channelFilter, setChannelFilter] = useState<string | undefined>(inFilter ? inFilter : dm_channels.find(c => c.peer_user_id == withFilter)?.name)

    const [dateFilter, setDateFilter] = useState<string | undefined>()

    const navigate = useNavigate()

    const handleNavigateToChannel = (channelID: string, baseMessage?: string, workspace?: string) => {
        onClose()
        let path = `/channel/${channelID}`
        if (workspace) {
            path = `/${workspace}/${channelID}`
        }
        navigate({
            pathname: path,
            search: `message_id=${baseMessage}`
        })
    }

    const handleScrollToMessage = async (messageName: string, channelID: string, workspace?: string) => {
        handleNavigateToChannel(channelID, messageName, workspace)
    }

    const users = useGetUserRecords()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    const showResults = useMemo(() => {
        const isChannelFilterApplied = channelFilter !== undefined
        const isUserFilterApplied = userFilter !== 'any' && userFilter !== undefined
        const isDateFilterApplied = dateFilter !== 'any' && dateFilter !== undefined
        return (debouncedText.length > 2 || isChannelFilterApplied || isUserFilterApplied || isDateFilterApplied || isOnlyInMyChannels === true)
    }, [debouncedText, channelFilter, userFilter, isOnlyInMyChannels, dateFilter])

    const { data, error, isLoading } = useFrappeGetCall<{ message: Message[] }>("raven.api.search.get_search_result", {
        filter_type: 'Message',
        search_text: debouncedText,
        from_user: userFilter === 'any' ? undefined : userFilter,
        in_channel: channelFilter === 'any' ? undefined : channelFilter,
        saved: isSaved,
        date: dateFilter === 'any' ? undefined : dateFilter,
        my_channel_only: isOnlyInMyChannels,
    }, showResults ? undefined : null, {
        revalidateOnFocus: false,
    })

    return (
        <Box>
            <Flex direction='column' gap='2'>
                <TextField.Root
                    onChange={handleChange}
                    type='text'
                    placeholder='Search messages'
                    value={searchText}
                    autoFocus>
                    <TextField.Slot side='left'>
                        <BiSearch />
                    </TextField.Slot>
                    <TextField.Slot side='right'>
                        {isLoading && <Loader />}
                    </TextField.Slot>
                </TextField.Root>
                <Grid
                    gap='2'
                    justify="between"
                    columns={
                        { initial: '2', md: '5' }
                    }
                    align='center'>
                    <Select.Root value={userFilter} onValueChange={setUserFilter}>
                        <Select.Trigger placeholder='From' id='from-filter' />
                        <Select.Content className="z-50">
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
                        <Select.Content className="z-50">
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
                        <Select.Content className="z-50">
                            <Select.Group>
                                <Select.Label>Date</Select.Label>
                                <Select.Item value='any'>Any time</Select.Item>
                                {dateOption.map((option) => <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>)}
                            </Select.Group>

                        </Select.Content>
                    </Select.Root>

                    <Text as="label" size="2">
                        <Flex gap="2">
                            <Checkbox checked={isOnlyInMyChannels} onCheckedChange={onToggleMyChannels} /> Only in my channels
                        </Flex>
                    </Text>

                    <Text as="label" size="2">
                        <Flex gap="2">
                            <Checkbox checked={isSaved} onCheckedChange={onToggleSaved} /> Saved
                        </Flex>
                    </Text>
                </Grid>
            </Flex>
            <ScrollArea type="always" scrollbars="vertical" className='sm:h-[420px] h-[58vh]' mt='4'>
                <ErrorBanner error={error} />
                {data?.message?.length === 0 && <EmptyStateForSearch />}
                {data?.message?.length && data?.message.length > 0 ? <Flex direction='column' gap='2'>
                    {data.message.map((message: Message) => {
                        return (
                            <MessageBox
                                key={message.name}
                                message={{
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