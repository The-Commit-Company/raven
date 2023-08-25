import { Avatar, Box, Button, Center, HStack, Icon, Spinner, Stack, Text, useModalContext, Image, Link } from "@chakra-ui/react"
import { Command } from "cmdk"
import { useFrappeGetCall, useSearch } from "frappe-react-sdk"
import { useContext, useState } from "react"
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi"
import { BsFillCircleFill, BsCircle } from "react-icons/bs"
import { TbFiles, TbHash, TbListSearch, TbMessages, TbSearch, TbUsers } from "react-icons/tb"
import { useNavigate } from "react-router-dom"
import { GetFileSearchResult } from "../../../types/Search/Search"
import { UserContext } from "../../../utils/auth/UserProvider"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { getFileExtensionIcon } from "../../../utils/layout/fileExtensionIcon"
import GlobalSearch from "../global-search/GlobalSearch"
import { getFileExtension, getFileName } from "../../../utils/operations"
import { useModalManager, ModalTypes } from "../../../hooks/useModalManager"
import { FilePreviewModal } from "../file-preview/FilePreviewModal"
import { FileSearchResult } from "../global-search/FileSearch"
import { User } from "../../../types/Core/User"

interface Props {
    searchChange: Function
    input: string
    isGlobalSearchModalOpen: boolean
    onGlobalSearchModalOpen: () => void
    onGlobalSearchModalClose: () => void
    onCommandPaletteClose: () => void
    children?: React.ReactNode
    inputRef?: React.RefObject<HTMLInputElement>
}

interface PeopleProps {
    users: User[]
    input: string
    activeUsers?: string[]
    gotoDMChannel?: Function
    currentUser?: string
    tabIndex?: number
    isChild?: boolean
    isGlobalSearchModalOpen: boolean
    onGlobalSearchModalOpen: () => void
    onGlobalSearchModalClose: () => void
    onCommandPaletteClose: () => void
}

interface ChannelsProps {
    input: string
    isGlobalSearchModalOpen: boolean
    isChild?: boolean
    onGlobalSearchModalOpen: () => void
    onGlobalSearchModalClose: () => void
    onCommandPaletteClose: () => void
}

interface FindInProps {
    input: string
    tabIndex: number
    placeholder?: string
    isGlobalSearchModalOpen: boolean
    onGlobalSearchModalOpen: () => void
    onGlobalSearchModalClose: () => void
    onCommandPaletteClose: () => void
}

export const Home = ({ searchChange, input, isGlobalSearchModalOpen, children, inputRef, onGlobalSearchModalOpen, onGlobalSearchModalClose, onCommandPaletteClose }: Props) => {
    const { channelData, channelMembers } = useContext(ChannelContext)
    const { currentUser } = useContext(UserContext)
    const peer = Object.keys(channelMembers).filter((member) => member !== currentUser)[0]
    const style = { paddingBottom: 2, paddingTop: 2 }
    const [inFilter, setInFilter] = useState<string>()
    const [withFilter, setWithFilter] = useState<string>()

    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='messages, files and more' tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} onCommandPaletteClose={onCommandPaletteClose} />
            <Command.Group style={style}>
                {channelData && <Item
                    onSelect={() => {
                        onGlobalSearchModalOpen()
                        if (channelData.is_direct_message) {
                            setWithFilter(channelData.is_self_message ? channelMembers[currentUser].name : channelMembers[peer].name)
                        }
                        else {
                            setInFilter(channelData.name)
                        }
                    }}
                >
                    <TbListSearch fontSize={20} />
                    {channelData.is_direct_message ?
                        (channelData.is_self_message ?
                            `Find in direct messages with ${channelMembers[currentUser].first_name}` :
                            `Find in direct messages with ${channelMembers[peer].first_name}`
                        ) :
                        `Find in ${channelData.channel_name}`
                    }
                </Item>}
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
            <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={0} input={input} inFilter={inFilter} withFilter={withFilter} onCommandPaletteClose={onCommandPaletteClose} />
        </Command.List>
    )
}

export const Messages = ({ searchChange, input, isGlobalSearchModalOpen, onGlobalSearchModalOpen, onGlobalSearchModalClose, onCommandPaletteClose }: Props) => {
    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='messages' tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} onCommandPaletteClose={onCommandPaletteClose} />
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

export const Files = ({ searchChange, input, isGlobalSearchModalOpen, onGlobalSearchModalOpen, onGlobalSearchModalClose, onCommandPaletteClose }: Props) => {

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
            <CommandPaletteEmptyState input={input} placeholder='files' tabIndex={1} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} onCommandPaletteClose={onCommandPaletteClose} />
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

export const Channels = ({ input, isGlobalSearchModalOpen, isChild, onGlobalSearchModalOpen, onGlobalSearchModalClose, onCommandPaletteClose }: ChannelsProps) => {

    const { data, isValidating } = useSearch('Raven Channel', input, [["is_direct_message", "=", "0"]], 20)
    const navigate = useNavigate()
    const { onClose } = useModalContext()

    return (
        <Command.List>
            {!isChild && <CommandPaletteEmptyState input={input} placeholder='channels' tabIndex={2} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} onCommandPaletteClose={onCommandPaletteClose} />}
            <Command.Group heading={data?.results?.length ? "Recent channels" : ""} style={isChild ?
                {
                    visibility: !!input ? 'visible' : 'hidden',
                    maxHeight: !!input ? '300px' : '0px'
                }
                : {}
            }>
                {isValidating && !data?.results?.length && <Text py='4' color='gray.500' textAlign='center' fontSize='sm'>No results found.</Text>}
                {isValidating && <Command.Loading>
                    <Center px='4' pb='2'>
                        <Box><Spinner size={'xs'} color='gray.400' /></Box>
                    </Center>
                </Command.Loading>}
                {data?.results?.map((r: { value: string, description: string, label: string }) => <Item key={r.value} value={r.value} onSelect={() => {
                    navigate(`/channel/${r.value}`)
                    onClose()
                }}>{r.description.includes("Private") && <BiLockAlt /> || r.description.includes("Public") && <BiHash /> || r.description.includes("Open") && <BiGlobe />}{r.label}</Item>)}
            </Command.Group>
        </Command.List>
    )
}

export const People = ({ input, users, activeUsers, gotoDMChannel, currentUser, isChild }: PeopleProps) => {
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
                if (user?.full_name?.toLowerCase().includes(input.toLowerCase())) {
                    return (
                        gotoDMChannel && activeUsers &&
                        <Item key={user.name}
                            onSelect={() => {
                                gotoDMChannel(user.name)
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

export const FindIn = ({ input, tabIndex, isGlobalSearchModalOpen, onGlobalSearchModalOpen, onGlobalSearchModalClose, onCommandPaletteClose }: FindInProps) => {
    const { data, isValidating } = useSearch('Raven Channel', input, [["is_direct_message", "=", "0"]], 20)
    const [inFilter, setInFilter] = useState<string>()
    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='messages' tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} onCommandPaletteClose={onCommandPaletteClose} />
            <Command.Group heading={data?.results?.length ? "Recent channels" : ""} >
                {isValidating && !data?.results?.length && <Text py='4' color='gray.500' textAlign='center' fontSize='sm'>No results found.</Text>}
                {isValidating && <Command.Loading>
                    <Center px='4' pb='2'>
                        <Box><Spinner size={'xs'} color='gray.400' /></Box>
                    </Center>
                </Command.Loading>}
                {data?.results?.map((r: { value: string, description: string, label: string }) => <Item key={r.value} value={r.value} onSelect={() => {
                    onGlobalSearchModalOpen()
                    setInFilter(r.value)
                }}>{r.description.includes("Private") && <BiLockAlt /> || r.description.includes("Public") && <BiHash /> || r.description.includes("Open") && <BiGlobe />}{r.label}</Item>)}
            </Command.Group>
            <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={tabIndex} input={""} inFilter={inFilter} onCommandPaletteClose={onCommandPaletteClose} />
        </Command.List>
    )
}

export const FindFrom = ({ input, users, tabIndex, isGlobalSearchModalOpen, onGlobalSearchModalOpen, onGlobalSearchModalClose, onCommandPaletteClose }: PeopleProps) => {
    const results_count = users.reduce((count, user) => {
        if (user?.full_name?.toLowerCase().includes(input.toLowerCase())) {
            return count + 1;
        }
        return count;
    }, 0)
    const [fromFilter, setFromFilter] = useState<string>()
    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='messages' tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} onCommandPaletteClose={onCommandPaletteClose} />
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
            {tabIndex != undefined && <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={tabIndex} input={""} fromFilter={fromFilter} onCommandPaletteClose={onCommandPaletteClose} />}
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
            key={value}
        >
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

export const CommandPaletteEmptyState = ({ input, placeholder, tabIndex, isGlobalSearchModalOpen, onGlobalSearchModalOpen, onGlobalSearchModalClose, onCommandPaletteClose }: FindInProps) => {
    return (
        <Command.Empty>
            <Button w='full' fontWeight="light" variant='ghost' alignContent='end' onClick={() => {
                onGlobalSearchModalOpen()
            }}>{input} - Search {placeholder}</Button>
            <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={tabIndex} input={input} onCommandPaletteClose={onCommandPaletteClose} />
        </Command.Empty>
    )
}