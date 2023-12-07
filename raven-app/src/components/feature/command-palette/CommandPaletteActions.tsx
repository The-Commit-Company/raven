import { Command } from "cmdk"
import { useFrappeGetCall } from "frappe-react-sdk"
import { useContext, useMemo, useState } from "react"
import { LuMailSearch, LuUsers } from "react-icons/lu"
import { BiSearch, BiHash } from "react-icons/bi"
import { useNavigate, useParams } from "react-router-dom"
import { GetFileSearchResult } from "../../../../../types/Search/Search"
import { UserContext } from "../../../utils/auth/UserProvider"
import GlobalSearch from "../GlobalSearch/GlobalSearch"
import { getFileExtension, getFileName } from "../../../utils/operations"
import { UserFields } from "@/utils/users/UserListProvider"
import { useCurrentChannelData } from "@/hooks/useCurrentChannelData"
import { ChannelListContext, ChannelListContextType, ChannelListItem, DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { FileExtensionIcon } from "@/utils/layout/FileExtIcon"
import { TbFileSearch, TbMessages } from "react-icons/tb"
import { Button, Flex, Text, Link, Box } from "@radix-ui/themes"
import { Loader } from "@/components/common/Loader"
import { UserAvatar } from "@/components/common/UserAvatar"
interface Props {
    searchChange: Function
    input: string
    onClose: VoidFunction
    isGlobalSearchModalOpen: boolean
    onGlobalSearchModalOpen: () => void
    onGlobalSearchModalClose: () => void
    children?: React.ReactNode
    inputRef?: React.RefObject<HTMLInputElement>
}

interface PeopleProps {
    users: UserFields[]
    input: string
    activeUsers?: string[]
    gotoDMChannel?: Function
    currentUser?: string
    tabIndex?: number
    onClose: VoidFunction
    isChild?: boolean
    isGlobalSearchModalOpen: boolean
    onGlobalSearchModalOpen: () => void
    onGlobalSearchModalClose: () => void
}

interface ChannelsProps {
    input: string
    isGlobalSearchModalOpen: boolean
    isChild?: boolean
    onClose: VoidFunction
    onGlobalSearchModalOpen: () => void
    onGlobalSearchModalClose: () => void
}

interface FindInProps {
    input: string
    tabIndex: number,
    onClose: VoidFunction
    placeholder?: string
    isGlobalSearchModalOpen: boolean
    onGlobalSearchModalOpen: () => void
    onGlobalSearchModalClose: () => void
}

export const Home = ({ searchChange, input, isGlobalSearchModalOpen, onClose, children, inputRef, onGlobalSearchModalOpen, onGlobalSearchModalClose }: Props) => {

    const { currentUser } = useContext(UserContext)
    const style = { paddingBottom: 2, paddingTop: 2 }
    const [inFilter, setInFilter] = useState<string>()
    const [withFilter, setWithFilter] = useState<string>()
    const { channelID } = useParams<{ channelID: string }>()
    const { channel } = useCurrentChannelData(channelID ?? 'general')
    const channelData = channel?.channelData as ChannelListItem
    const channelDMData = channel?.channelData as DMChannelListItem
    const users = useGetUserRecords()

    const onSearchChange = (value: string) => {
        searchChange(value)
        if (inputRef) { inputRef.current?.focus() }
    }

    return (
        <Command.List>
            <CommandPaletteEmptyState onClose={onClose} input={input} placeholder='messages, files and more' tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />
            <Command.Group style={style}>
                <Item
                    onSelect={() => {
                        onGlobalSearchModalOpen()
                        if (channel?.type === 'dm') {
                            setWithFilter(channelData.is_self_message ? channelDMData.owner : channelDMData.peer_user_id)
                        }
                        else {
                            setInFilter(channelData.name)
                        }
                    }}
                >
                    <LuMailSearch size='18' />
                    {channelData.is_direct_message ?
                        (channelData.is_self_message ?
                            `Find in direct messages with ${users[currentUser].first_name}` :
                            `Find in direct messages with ${users[channelDMData.peer_user_id]?.first_name ?? channelDMData.peer_user_id}`
                        ) :
                        `Find in ${channelData.channel_name}`
                    }
                </Item>
            </Command.Group>
            {children}
            {
                !input &&
                <Command.Group heading="I'm looking for..." >
                    <Command.Item onSelect={() => {
                        onSearchChange('messages')
                    }}>
                        <TbMessages size='18' />
                        Messages
                    </Command.Item>

                    <Command.Item onSelect={() => {
                        onSearchChange('files')
                    }}>
                        <TbFileSearch size='18' />
                        Files
                    </Command.Item>

                    <Command.Item onSelect={() => {
                        onSearchChange('channels')
                    }}>
                        <BiHash size='18' />
                        Channels
                    </Command.Item>

                    <Command.Item onSelect={() => {
                        onSearchChange('people')
                    }}>
                        <LuUsers size='18' />
                        People
                    </Command.Item>
                </Command.Group>
            }
            <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={0} input={input} inFilter={inFilter} withFilter={withFilter} onCommandPaletteClose={onClose} />
        </Command.List >
    )
}

export const Messages = ({ searchChange, input, onClose, isGlobalSearchModalOpen, onGlobalSearchModalOpen, onGlobalSearchModalClose }: Props) => {
    return (
        <Command.List>
            <CommandPaletteEmptyState onClose={onClose} input={input} placeholder='messages' tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />
            {!input && <Command.Group heading="Narrow your search">
                <Item onSelect={() => {
                    searchChange('in')
                }}><BiSearch />in a channel</Item>
                <Item onSelect={() => {
                    searchChange('from')
                }}><BiSearch />from anyone on Raven</Item>
            </Command.Group>}
        </Command.List>
    )
}

export const Files = ({ searchChange, input, onClose, isGlobalSearchModalOpen, onGlobalSearchModalOpen, onGlobalSearchModalClose }: Props) => {

    const { data, isLoading } = useFrappeGetCall<{ message: GetFileSearchResult[] }>("raven.api.search.get_search_result", {
        filter_type: 'File',
        doctype: 'Raven Message',
        search_text: input,
        page_length: 5
    }, undefined, {
        revalidateOnFocus: false
    })

    const [selectedFile, setSelectedFile] = useState<GetFileSearchResult>()

    return (
        <Command.List>
            <CommandPaletteEmptyState onClose={onClose} input={input} placeholder='files' tabIndex={1} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />
            {!input && <Command.Group heading="Narrow your search">
                <Item onSelect={() => {
                    searchChange('in')
                }}><BiSearch />in a channel</Item>
                <Item onSelect={() => {
                    searchChange('from')
                }}><BiSearch />from anyone on Raven</Item>
            </Command.Group>}
            <Command.Group heading={data?.message.length ? "Recent files" : ""}>
                {isLoading && !data?.message.length && <Box width='100%' className="text-center"><Text weight='medium' size='1' color='gray'>No results found.</Text></Box>}
                {isLoading && <Command.Loading>
                    <Flex align='center' justify='center' px='4' pb='2'>
                        <Box><Loader /></Box>
                    </Flex>
                </Command.Loading>}
                {data?.message?.map((f) => {
                    return (<Item key={f.name}>
                        <Flex gap='3' align='center'>
                            <Flex className="w-8 h-8" align='center' justify='center'>
                                {f.message_type === 'File' && <FileExtensionIcon ext={getFileExtension(f.file)} />}
                                {f.message_type === 'Image' && <img src={f.file} alt='File preview' className="object-cover w-8 h-8 rounded-sm" />}
                            </Flex>
                            <Box>
                                {f.file && <Link size='1' color='gray' className="text-accent-12" onClick={() => setSelectedFile(f)}>{getFileName(f.file)}</Link>}
                            </Box>
                        </Flex></Item>)
                })}
            </Command.Group>
            {/* <FilePreviewModal
                isOpen={modalManager.modalType === ModalTypes.FilePreview}
                onClose={modalManager.closeModal}
                {...modalManager.modalContent}
            /> */}
        </Command.List>
    )
}

export const Channels = ({ input, isGlobalSearchModalOpen, onClose, isChild, onGlobalSearchModalOpen, onGlobalSearchModalClose }: ChannelsProps) => {

    return (
        <Command.List>
            {!isChild && <CommandPaletteEmptyState onClose={onClose} input={input} placeholder='channels' tabIndex={2} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />}
            <ChannelGroup input={input} isChild={isChild} onClose={onClose} />
        </Command.List>
    )
}

type ChannelGroupProps = Pick<ChannelsProps, 'input' | 'isChild' | 'onClose'>
export const ChannelGroup = ({ input, isChild, onClose }: ChannelGroupProps) => {
    const navigate = useNavigate()
    const { channels } = useContext(ChannelListContext) as ChannelListContextType

    const results_count = channels.reduce((count, channel) => {
        if (channel?.channel_name?.toLowerCase().includes(input.toLowerCase())) {
            return count + 1;
        }
        return count;
    }, 0)
    if (isChild && !input) {
        return null
    }


    return <Command.Group heading={results_count > 0 ? "Recent channels" : ""} style={isChild ?
        {
            visibility: !!input ? 'visible' : 'hidden',
            maxHeight: !!input ? '300px' : '0px'
        }
        : {}
    }>
        {results_count === 0 && <Box width='100%' className="text-center"><Text weight='medium' size='1' color='gray'>No results found.</Text></Box>}
        {channels?.map((channel: ChannelListItem) => {
            if (channel?.channel_name?.toLowerCase().includes(input.toLowerCase())) {
                return (
                    <Item key={channel.name} value={channel.channel_name} onSelect={() => {
                        navigate(`/channel/${channel.name}`)
                        onClose()
                    }}><ChannelIcon type={channel?.type} />{channel.channel_name} {channel.is_archived ? '(archived)' : ''}</Item>)
            }
        }
        )}
    </Command.Group>

}

export const People = ({ isChild, ...props }: PeopleProps) => {


    return <Command.List>
        {!isChild && <Command.Empty>
            <Text>No results found.</Text>
        </Command.Empty>}
        <PeopleGroup isChild={isChild} {...props} />
    </Command.List>
}

export const PeopleGroup = ({ input, users, activeUsers, gotoDMChannel, currentUser, isChild, onClose }: PeopleProps) => {
    const lowerCasedInput = useMemo(() => input.toLowerCase(), [input])

    const results_count = users.reduce((count, user) => {
        if (user?.full_name?.toLowerCase().includes(input.toLowerCase())) {
            return count + 1;
        }
        return count;
    }, 0)

    if (isChild && !input) {
        return null
    }
    return <Command.Group heading={results_count > 0 ? "Recent direct messages" : ""} style={isChild ?
        {
            visibility: !!input ? 'visible' : 'hidden',
            maxHeight: !!input ? '300px' : '0px'
        }
        : {}
    }>
        {users.map(user => {
            if (user?.full_name?.toLowerCase().includes(lowerCasedInput) && gotoDMChannel && activeUsers && user.name !== "Administrator") {
                return (
                    <Item key={user.name}
                        onSelect={() => {
                            gotoDMChannel(user.name)
                            onClose()
                        }}>
                        <Flex p='1' gap='2' align='center'>
                            <UserAvatar src={user.user_image} alt={user.full_name} size='1' isActive={activeUsers.includes(user.name)} />
                            <Flex gap='2'>
                                {user.name === currentUser ? <Text as='span'>{user.full_name} (you)</Text> : <Text as='span'>{user.full_name}</Text>}
                            </Flex>
                        </Flex>
                    </Item>)
            }
        })}
    </Command.Group>
}

export const FindIn = ({ input, tabIndex, isGlobalSearchModalOpen, onClose, onGlobalSearchModalOpen, onGlobalSearchModalClose }: FindInProps) => {

    const { channels } = useContext(ChannelListContext) as ChannelListContextType
    const [inFilter, setInFilter] = useState<string>()

    const results_count = channels.reduce((count, channel) => {
        if (channel?.channel_name?.toLowerCase().includes(input.toLowerCase())) {
            return count + 1;
        }
        return count;
    }, 0)

    return (
        <Command.List>
            <CommandPaletteEmptyState onClose={onClose} input={input} placeholder='messages' tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />
            <Command.Group heading={results_count > 0 ? "Recent channels" : ""} >
                {results_count === 0 && <Box width='100%' className="text-center"><Text weight='medium' size='1' color='gray'>No results found.</Text></Box>}
                {channels?.map((channel: ChannelListItem) => {
                    if (channel?.channel_name?.toLowerCase().includes(input.toLowerCase())) {
                        return (
                            <Item key={channel.name} value={channel.channel_name}
                                onSelect={() => {
                                    onGlobalSearchModalOpen()
                                    setInFilter(channel.name)
                                }}>
                                <ChannelIcon type={channel?.type} /> {channel.channel_name}</Item>)
                    }
                })}
            </Command.Group>
            <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={tabIndex} input={""} inFilter={inFilter} onCommandPaletteClose={onClose} />
        </Command.List>
    )
}

export const FindFrom = ({ input, users, tabIndex, isGlobalSearchModalOpen, onClose, onGlobalSearchModalOpen, onGlobalSearchModalClose }: PeopleProps) => {

    const results_count = users.reduce((count, user) => {
        if (user?.full_name?.toLowerCase().includes(input.toLowerCase())) {
            return count + 1;
        }
        return count;
    }, 0)
    const [fromFilter, setFromFilter] = useState<string>()
    return (
        <Command.List>
            <CommandPaletteEmptyState onClose={onClose} input={input} placeholder='messages' tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />
            <Command.Group heading={results_count > 0 ? "Recent direct messages" : ""} >
                {users.map(user => {
                    if (user?.full_name?.toLowerCase().includes(input.toLowerCase())) {
                        return (
                            <Item key={user.name}
                                onSelect={() => {
                                    onGlobalSearchModalOpen()
                                    setFromFilter(user.name)
                                }}>
                                <Flex p='1' gap='2' align='center'>
                                    <UserAvatar src={user.user_image} alt={user.full_name} size='1' />
                                    <Text as='span'>{user.full_name}</Text>
                                </Flex>
                            </Item>)
                    }
                })}
            </Command.Group>
            {tabIndex != undefined && <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={tabIndex} input={""} fromFilter={fromFilter} onCommandPaletteClose={onClose} />}
        </Command.List>
    )
}

export const Item = ({
    children,
    shortcut,
    onSelect = () => { },
    value
}: {
    children: React.ReactNode
    shortcut?: string
    onSelect?: (value: string) => void,
    value?: string
}) => {
    return (
        <Command.Item
            onSelect={onSelect}
            value={value}
            key={value}>
            {children}
            {shortcut && (
                <div cmdk-shortcuts="">
                    {shortcut.split(' ').map((key) => {
                        return <kbd key={key}>{key}</kbd>
                    })}
                </div>
            )}
        </Command.Item>
    )
}

export const CommandPaletteEmptyState = ({ input, placeholder, tabIndex, isGlobalSearchModalOpen, onClose, onGlobalSearchModalOpen, onGlobalSearchModalClose }: FindInProps) => {

    return (
        <Command.Empty>
            <Button variant='soft' className="cursor-pointer" onClick={() => {
                onGlobalSearchModalOpen()
            }}>{input} - Search {placeholder}</Button>
            <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={tabIndex} input={input} onCommandPaletteClose={onClose} />
        </Command.Empty>
    )
}