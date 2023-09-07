import { Avatar, Box, Button, Center, HStack, Icon, Spinner, Stack, Text, useModalContext, Image, Link } from "@chakra-ui/react"
import { Command } from "cmdk"
import { useFrappeGetCall } from "frappe-react-sdk"
import { useContext, useMemo, useState } from "react"
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi"
import { BsFillCircleFill, BsCircle } from "react-icons/bs"
import { TbFiles, TbHash, TbListSearch, TbMessages, TbSearch, TbUsers } from "react-icons/tb"
import { useNavigate, useParams } from "react-router-dom"
import { GetFileSearchResult } from "../../../../../types/Search/Search"
import { UserContext } from "../../../utils/auth/UserProvider"
import { getFileExtensionIcon } from "../../../utils/layout/fileExtensionIcon"
import GlobalSearch from "../global-search/GlobalSearch"
import { getFileExtension, getFileName } from "../../../utils/operations"
import { useModalManager, ModalTypes } from "../../../hooks/useModalManager"
import { FilePreviewModal } from "../file-preview/FilePreviewModal"
import { FileSearchResult } from "../global-search/FileSearch"
import { UserFields } from "@/utils/users/UserListProvider"
import { useCurrentChannelData } from "@/hooks/useCurrentChannelData"
import { ChannelListContext, ChannelListContextType, ChannelListItem, DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"

interface Props {
    searchChange: Function
    input: string
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
    isChild?: boolean
    isGlobalSearchModalOpen: boolean
    onGlobalSearchModalOpen: () => void
    onGlobalSearchModalClose: () => void
}

interface ChannelsProps {
    input: string
    isGlobalSearchModalOpen: boolean
    isChild?: boolean
    onGlobalSearchModalOpen: () => void
    onGlobalSearchModalClose: () => void
}

interface FindInProps {
    input: string
    tabIndex: number
    placeholder?: string
    isGlobalSearchModalOpen: boolean
    onGlobalSearchModalOpen: () => void
    onGlobalSearchModalClose: () => void
}

export const Home = ({ searchChange, input, isGlobalSearchModalOpen, children, inputRef, onGlobalSearchModalOpen, onGlobalSearchModalClose }: Props) => {

    const { currentUser } = useContext(UserContext)
    const style = { paddingBottom: 2, paddingTop: 2 }
    const [inFilter, setInFilter] = useState<string>()
    const [withFilter, setWithFilter] = useState<string>()
    const { channelID } = useParams<{ channelID: string }>()
    const { channel } = useCurrentChannelData(channelID ?? 'general')
    const channelData = channel?.channelData as ChannelListItem
    const channelDMData = channel?.channelData as DMChannelListItem
    const users = useGetUserRecords()
    const { onClose } = useModalContext()

    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='messages, files and more' tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />
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
                    <TbListSearch fontSize={20} />
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
            {!input &&
                <Command.Group heading="I'm looking for..." style={style} >
                    <HStack p={1} spacing={3}>
                        <Button
                            leftIcon={<TbMessages fontSize={20} />}
                            variant="outline"
                            fontSize={12}
                            h={8}
                            onClick={() => {
                                searchChange('messages')
                                if (inputRef) { inputRef.current?.focus() }
                            }}
                        >
                            Messages
                        </Button>
                        <Button
                            leftIcon={<TbFiles fontSize={20} />}
                            variant="outline"
                            fontSize={12}
                            h={8}
                            onClick={() => {
                                searchChange('files')
                                if (inputRef) { inputRef.current?.focus() }
                            }}
                        >
                            Files
                        </Button>
                        <Button
                            leftIcon={<TbHash fontSize={20} />}
                            variant="outline"
                            fontSize={12}
                            h={8}
                            onClick={() => {
                                searchChange('channels')
                                if (inputRef) { inputRef.current?.focus() }
                            }}
                        >
                            Channels
                        </Button>
                        <Button
                            leftIcon={<TbUsers fontSize={20} />}
                            variant="outline"
                            fontSize={12}
                            h={8}
                            onClick={() => {
                                searchChange('people')
                                if (inputRef) { inputRef.current?.focus() }
                            }}
                        >
                            People
                        </Button>
                    </HStack>
                </Command.Group>}
            <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={0} input={input} inFilter={inFilter} withFilter={withFilter} onCommandPaletteClose={onClose} />
        </Command.List>
    )
}

export const Messages = ({ searchChange, input, isGlobalSearchModalOpen, onGlobalSearchModalOpen, onGlobalSearchModalClose }: Props) => {
    const { onClose } = useModalContext()
    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='messages' tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />
            {!input && <Command.Group heading="Narrow your search">
                <Item onSelect={() => {
                    searchChange('in')
                }}><TbSearch />in a channel</Item>
                <Item onSelect={() => {
                    searchChange('from')
                }}><TbSearch />from anyone on Raven</Item>
            </Command.Group>}
        </Command.List>
    )
}

export const Files = ({ searchChange, input, isGlobalSearchModalOpen, onGlobalSearchModalOpen, onGlobalSearchModalClose }: Props) => {

    const { onClose } = useModalContext()

    const { data, isValidating } = useFrappeGetCall<{ message: GetFileSearchResult[] }>("raven.api.search.get_search_result", {
        filter_type: 'File',
        doctype: 'Raven Message',
        search_text: input,
        page_length: 5
    }, undefined, {
        revalidateOnFocus: false
    })
    const modalManager = useModalManager()

    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='files' tabIndex={1} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />
            {!input && <Command.Group heading="Narrow your search">
                <Item onSelect={() => {
                    searchChange('in')
                }}><TbSearch />in a channel</Item>
                <Item onSelect={() => {
                    searchChange('from')
                }}><TbSearch />from anyone on Raven</Item>
            </Command.Group>}
            <Command.Group heading={data?.message.length ? "Recent files" : ""}>
                {isValidating && !data?.message.length && <Text py='4' color='gray.500' textAlign='center' fontSize='sm'>No results found.</Text>}
                {isValidating && <Command.Loading>
                    <Center px='4' pb='2'>
                        <Box><Spinner size={'xs'} color='gray.400' /></Box>
                    </Center>
                </Command.Loading>}
                {data?.message?.map((f: FileSearchResult) => {
                    const onFilePreviewModalOpen = () => {
                        modalManager.openModal(ModalTypes.FilePreview, {
                            file: f.file,
                            owner: f.owner,
                            creation: f.creation,
                            message_type: f.message_type
                        })
                    }
                    return (<Item key={f.name}>
                        <HStack spacing={3}>
                            <Center maxW='50px'>
                                {f.message_type === 'File' && <Icon as={getFileExtensionIcon(getFileExtension(f.file))} boxSize="6" />}
                                {f.message_type === 'Image' && <Image src={f.file} alt='File preview' boxSize={6} rounded='md' fit='cover' />}
                            </Center>
                            <Stack spacing={0}>
                                {f.file && <Link fontSize='sm' onClick={onFilePreviewModalOpen}>{getFileName(f.file)}</Link>}
                            </Stack>
                        </HStack></Item>)
                })}
            </Command.Group>
            <FilePreviewModal
                isOpen={modalManager.modalType === ModalTypes.FilePreview}
                onClose={modalManager.closeModal}
                {...modalManager.modalContent}
            />
        </Command.List>
    )
}

export const Channels = ({ input, isGlobalSearchModalOpen, isChild, onGlobalSearchModalOpen, onGlobalSearchModalClose }: ChannelsProps) => {

    const navigate = useNavigate()
    const { onClose } = useModalContext()
    const { channels } = useContext(ChannelListContext) as ChannelListContextType

    const results_count = channels.reduce((count, channel) => {
        if (channel?.channel_name?.toLowerCase().includes(input.toLowerCase())) {
            return count + 1;
        }
        return count;
    }, 0)

    return (
        <Command.List>
            {!isChild && <CommandPaletteEmptyState input={input} placeholder='channels' tabIndex={2} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />}
            <Command.Group heading={results_count > 0 ? "Recent channels" : ""} style={isChild ?
                {
                    visibility: !!input ? 'visible' : 'hidden',
                    maxHeight: !!input ? '300px' : '0px'
                }
                : {}
            }>
                {results_count === 0 && <Text py='4' color='gray.500' textAlign='center' fontSize='sm'>No results found.</Text>}
                {channels?.map((channel: ChannelListItem) => {
                    if (channel?.channel_name?.toLowerCase().includes(input.toLowerCase())) {
                        return (
                            <Item key={channel.name} value={channel.channel_name} onSelect={() => {
                                navigate(`/channel/${channel.name}`)
                                onClose()
                            }}>{channel?.type === "Private" && <BiLockAlt /> || channel?.type === "Public" && <BiHash /> || channel?.type === "Open" && <BiGlobe />}{channel.channel_name} {channel.is_archived ? '(archived)' : ''}</Item>)
                    }
                }
                )}
            </Command.Group>
        </Command.List>
    )
}

export const People = ({ input, users, activeUsers, gotoDMChannel, currentUser, isChild }: PeopleProps) => {

    const { onClose } = useModalContext()

    const lowerCasedInput = useMemo(() => input.toLowerCase(), [input])

    const results_count = users.reduce((count, user) => {
        if (user?.full_name?.toLowerCase().includes(input.toLowerCase())) {
            return count + 1;
        }
        return count;
    }, 0)
    return <Command.List>
        {!isChild && <Command.Empty>
            <Text>No results found.</Text>
        </Command.Empty>}
        < Command.Group heading={results_count > 0 ? "Recent direct messages" : ""} style={isChild ?
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
                            <HStack p='2' spacing={3}>
                                <Avatar size='xs' src={user.user_image} name={user.full_name} borderRadius='md' />
                                <HStack spacing={2}>
                                    {user.name === currentUser ? <Text>{user.full_name} (you)</Text> : <Text>{user.full_name}</Text>}
                                    {activeUsers.includes(user.name) ?
                                        <Icon as={BsFillCircleFill} color='green.500' h='8px' /> :
                                        <Icon as={BsCircle} h='8px' />}
                                </HStack>
                            </HStack>
                        </Item>)
                }
            })}
        </Command.Group>
    </Command.List>
}

export const FindIn = ({ input, tabIndex, isGlobalSearchModalOpen, onGlobalSearchModalOpen, onGlobalSearchModalClose }: FindInProps) => {

    const { onClose } = useModalContext()

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
            <CommandPaletteEmptyState input={input} placeholder='messages' tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />
            <Command.Group heading={results_count > 0 ? "Recent channels" : ""} >
                {results_count === 0 && <Text py='4' color='gray.500' textAlign='center' fontSize='sm'>No results found.</Text>}
                {channels?.map((channel: ChannelListItem) => {
                    if (channel?.channel_name?.toLowerCase().includes(input.toLowerCase())) {
                        return (
                            <Item key={channel.name} value={channel.channel_name}
                                onSelect={() => {
                                    onGlobalSearchModalOpen()
                                    setInFilter(channel.name)
                                }}>
                                {channel?.type === "Private" && <BiLockAlt /> || channel?.type === "Public" && <BiHash /> || channel?.type === "Open" && <BiGlobe />}{channel.channel_name}</Item>)
                    }
                })}
            </Command.Group>
            <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={tabIndex} input={""} inFilter={inFilter} onCommandPaletteClose={onClose} />
        </Command.List>
    )
}

export const FindFrom = ({ input, users, tabIndex, isGlobalSearchModalOpen, onGlobalSearchModalOpen, onGlobalSearchModalClose }: PeopleProps) => {

    const { onClose } = useModalContext()

    const results_count = users.reduce((count, user) => {
        if (user?.full_name?.toLowerCase().includes(input.toLowerCase())) {
            return count + 1;
        }
        return count;
    }, 0)
    const [fromFilter, setFromFilter] = useState<string>()
    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='messages' tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />
            <Command.Group heading={results_count > 0 ? "Recent direct messages" : ""} >
                {users.map(user => {
                    if (user?.full_name?.toLowerCase().includes(input.toLowerCase())) {
                        return (
                            <Item key={user.name}
                                onSelect={() => {
                                    onGlobalSearchModalOpen()
                                    setFromFilter(user.name)
                                }}>
                                <HStack p='2' spacing={3}>
                                    <Avatar size='sm' src={user.user_image} name={user.full_name} borderRadius='md' />
                                    <Text>{user.full_name}</Text>
                                </HStack>
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

export const CommandPaletteEmptyState = ({ input, placeholder, tabIndex, isGlobalSearchModalOpen, onGlobalSearchModalOpen, onGlobalSearchModalClose }: FindInProps) => {

    const { onClose } = useModalContext()

    return (
        <Command.Empty>
            <Button w='full' fontWeight="light" variant='ghost' alignContent='end' onClick={() => {
                onGlobalSearchModalOpen()
            }}>{input} - Search {placeholder}</Button>
            <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={tabIndex} input={input} onCommandPaletteClose={onClose} />
        </Command.Empty>
    )
}