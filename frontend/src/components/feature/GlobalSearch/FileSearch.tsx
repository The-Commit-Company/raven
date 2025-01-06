import { BiSearch } from 'react-icons/bi'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useState, useContext } from 'react'
import { useDebounce } from '../../../hooks/useDebounce'
import { GetFileSearchResult } from '../../../../../types/Search/Search'
import { FileExtensionIcon } from '../../../utils/layout/FileExtIcon'
import { getFileExtension, getFileName } from '../../../utils/operations'
import { ErrorBanner } from '../../layout/AlertBanner/ErrorBanner'
import { EmptyStateForSearch } from '../../layout/EmptyState/EmptyState'
import { UserFields } from '@/utils/users/UserListProvider'
import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { DateMonthYear } from '@/utils/dateConversions'
import { Box, Checkbox, Flex, Grid, Select, TextField, Text, ScrollArea, Link } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { UserAvatar } from '@/components/common/UserAvatar'
import { dateOption } from './GlobalSearch'

interface Props {
    onToggleMyChannels: () => void,
    isOnlyInMyChannels: boolean,
    input: string,
    fromFilter?: string,
    withFilter?: string,
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

export const FileSearch = ({ onToggleMyChannels, isOnlyInMyChannels, onToggleSaved, isSaved, input, fromFilter, withFilter, inFilter }: Props) => {

    const [searchText, setSearchText] = useState(input)
    const debouncedText = useDebounce(searchText)

    const { channels, dm_channels } = useContext(ChannelListContext) as ChannelListContextType

    const [userFilter, setUserFilter] = useState<string | undefined>(fromFilter)

    // By default, use the "In filter" to set the channel filter. If the "In filter" is not set, use the "With filter" to set the channel filter.
    const [channelFilter, setChannelFilter] = useState<string | undefined>(inFilter ? inFilter : dm_channels.find(c => c.peer_user_id == withFilter)?.name)

    const [dateFilter, setDateFilter] = useState<string | undefined>()

    const [fileType, setFileType] = useState<string | undefined>()

    const users = useGetUserRecords()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    const { data, error, isLoading } = useFrappeGetCall<{ message: GetFileSearchResult[] }>("raven.api.search.get_search_result", {
        filter_type: 'File',
        search_text: debouncedText,
        from_user: userFilter === 'any' ? undefined : userFilter,
        in_channel: channelFilter === 'any' ? undefined : channelFilter,
        saved: isSaved,
        date: dateFilter,
        file_type: fileType === 'any' ? undefined : fileType,
        message_type: fileType === 'any' || fileType === undefined ? undefined : fileType === 'image' ? 'Image' : 'File',
        my_channel_only: isOnlyInMyChannels,
    }, undefined, {
        revalidateOnFocus: false
    })

    return (
        <Box>
            <Flex direction='column' gap='2'>
                <Flex align='center' gap='2'>
                    <TextField.Root style={{
                        width: '80%'
                    }}
                        onChange={handleChange}
                        type='text'
                        placeholder='Search messages'
                        value={searchText}
                        autoFocus
                    >
                        <TextField.Slot side='left'>
                            <BiSearch />
                        </TextField.Slot>
                        <TextField.Slot side='right'>
                            {isLoading && <Loader />}
                        </TextField.Slot>
                    </TextField.Root>
                    <Select.Root value={fileType} onValueChange={setFileType} >
                        <Select.Trigger placeholder='File Type' className='min-w-[20%]' />
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
                                    <Flex align='center' gap='1'>
                                        <FileExtensionIcon ext={'pdf'} />
                                        PDF
                                    </Flex>
                                </Select.Item>
                                <Select.Item value='doc'>
                                    <Flex align='center' gap='1'>
                                        <FileExtensionIcon ext={'doc'} />
                                        Documents (.doc)
                                    </Flex>
                                </Select.Item>
                                <Select.Item value='ppt'>
                                    <Flex align='center' gap='1'>
                                        <FileExtensionIcon ext={'ppt'} />
                                        Presentations (.ppt)
                                    </Flex>
                                </Select.Item>
                                <Select.Item value='xls'>
                                    <Flex align='center' gap='1'>
                                        <FileExtensionIcon ext={'xls'} />
                                        Spreadsheets (.xls)
                                    </Flex>
                                </Select.Item>
                                <Select.Item value='image'>
                                    <Flex align='center' gap='1'>
                                        <FileExtensionIcon ext='jpg' />
                                        Images
                                    </Flex>
                                </Select.Item>
                            </Select.Group>

                        </Select.Content>
                    </Select.Root>
                </Flex>

                <Grid
                    gap='2'
                    justify="between"
                    columns={{ initial: '2', md: '5' }}
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
                {data?.message && data.message.length > 0 ?

                    <Flex direction='column' gap='4'>
                        {data.message.map((f: FileSearchResult) => {
                            return (
                                <Flex gap='3' key={f.name} align='center'>
                                    <Flex align='center' justify='center' className='w-[10%] sm:w-[5%]'>
                                        {f.message_type === 'File' && <FileExtensionIcon ext={getFileExtension(f.file)} size='24' />}
                                        {f.message_type === 'Image' && <img src={f.file} alt='File preview' className='rounded-md object-cover' style={{
                                            width: '36px',
                                            height: '36px',
                                        }}
                                        />}
                                    </Flex>
                                    <Flex direction='column' className='w-[94%]'>
                                        {f.file && <Link weight='medium' size='1' href={f.file} target='_blank'>{getFileName(f.file)}</Link>}
                                        {users && <Text size='1' color='gray'>Shared by {Object.values(users).find((user: UserFields) => user.name === f.owner)?.full_name} on <DateMonthYear date={f.creation} /></Text>}
                                    </Flex>
                                </Flex>
                            )
                        })}
                    </Flex> : null}
            </ScrollArea>
        </Box>
    )
}