import { BiSearch } from 'react-icons/bi'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../../../hooks/useDebounce'
import { GetChannelSearchResult } from '../../../../../types/Search/Search'
import { ErrorBanner } from '../../layout/AlertBanner'
import { EmptyStateForSearch } from '../../layout/EmptyState/EmptyState'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { Flex, Select, TextField, Box, Checkbox, ScrollArea, Text, Badge } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
interface Props {
    onToggleMyChannels: () => void,
    isOpenMyChannels: boolean,
    input: string,
    onClose: () => void
}

export const ChannelSearch = ({ onToggleMyChannels, isOpenMyChannels, input, onClose }: Props) => {

    const [searchText, setSearchText] = useState(input)
    const debouncedText = useDebounce(searchText)

    const [channelType, setChannelType] = useState<string | undefined>()

    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    const { data, error, isLoading } = useFrappeGetCall<{ message: GetChannelSearchResult[] }>("raven.api.search.get_search_result", {
        filter_type: 'Channel',
        doctype: 'Raven Channel',
        search_text: debouncedText,
        channel_type: channelType === 'any' ? undefined : channelType,
        my_channel_only: isOpenMyChannels,
    }, undefined, {
        revalidateOnFocus: false
    })

    return (
        <Box>
            <Flex direction='column' gap='2'>
                <Flex align='center' gap='2'>
                    <TextField.Root style={{
                        width: '60%'
                    }}>
                        <TextField.Slot>
                            <BiSearch />
                        </TextField.Slot>
                        <TextField.Input
                            onChange={handleChange}
                            type='text'
                            placeholder='Search channels'
                            value={searchText}
                            autoFocus />
                        <TextField.Slot>
                            {isLoading && <Loader />}
                        </TextField.Slot>
                    </TextField.Root>

                    <Select.Root value={channelType} onValueChange={setChannelType} >
                        <Select.Trigger placeholder='Channel Type' style={{
                            width: '20%'
                        }} />
                        <Select.Content>
                            <Select.Group>
                                <Select.Label>Channel Type</Select.Label>
                                <Select.Item value='any'>
                                    <Flex align='center' gap='1'>
                                        <Box width='4'>
                                            🤷🏻‍♀️
                                        </Box>
                                        Any
                                    </Flex>
                                </Select.Item>
                                <Select.Item value='Public'>
                                    <Flex align='center' gap='1'>
                                        <ChannelIcon type='Public' />
                                        Public
                                    </Flex>
                                </Select.Item>
                                <Select.Item value='Private'>
                                    <Flex align='center' gap='1'>
                                        <ChannelIcon type='Private' />
                                        Private
                                    </Flex>
                                </Select.Item>
                                <Select.Item value='Open'>
                                    <Flex align='center' gap='1'>
                                        <ChannelIcon type='Open' />
                                        Open
                                    </Flex>
                                </Select.Item>

                            </Select.Group>

                        </Select.Content>
                    </Select.Root>

                    <Text as="label" style={{
                        width: '20%'
                    }}>
                        <Flex gap="2" align='center'>
                            <Checkbox checked={isOpenMyChannels} onCheckedChange={onToggleMyChannels} /> Only in my channels
                        </Flex>
                    </Text>
                </Flex>
            </Flex>
            <ScrollArea type="always" scrollbars="vertical" style={{ height: 420 }} mt='4'>
                <ErrorBanner error={error} />
                {data?.message?.length === 0 && <EmptyStateForSearch />}
                {data?.message && data.message.length > 0 ?
                    <Flex direction='column' gap='2' pr='4'>

                        {data.message.map((channel: GetChannelSearchResult) => {
                            return (
                                <Box p='2'
                                    role='link'
                                    className='hover:bg-gray-3 rounded-md cursor-pointer'
                                    onClick={() => {
                                        navigate(`/channel/${channel.name}`)
                                        onClose()
                                    }}
                                    key={channel.name}>
                                    <Flex gap='2' align='center'>
                                        <ChannelIcon type={channel.type} size='20' />
                                        <Flex gap='3'>
                                            <Text as='span' weight='medium'>{channel.channel_name}</Text>
                                            {channel.is_archived ? <Badge variant='soft' color='gray' size='1'>Archived</Badge> : null}
                                        </Flex>
                                    </Flex>
                                </Box>
                            )
                        }
                        )}
                    </Flex> : null}
            </ScrollArea>
        </Box>
    )
}