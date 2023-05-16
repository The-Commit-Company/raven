import { Avatar, Box, Button, Center, HStack, Icon, Spinner, Stack, Text, useDisclosure, useModalContext, Image, Link } from "@chakra-ui/react"
import { Command } from "cmdk"
import { Filter, useFrappeGetCall, useSearch } from "frappe-react-sdk"
import { useContext, useState } from "react"
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi"
import { BsFillCircleFill, BsCircle } from "react-icons/bs"
import { TbFiles, TbHash, TbListSearch, TbMessages, TbSearch, TbUsers } from "react-icons/tb"
import { useNavigate } from "react-router-dom"
import { GetFileSearchResult } from "../../../types/Search/Search"
import { User } from "../../../types/User/User"
import { UserContext } from "../../../utils/auth/UserProvider"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { getFileExtensionIcon } from "../../../utils/layout/fileExtensionIcon"
import GlobalSearch from "../global-search/GlobalSearch"
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer"

interface Props {
    searchChange: Function
    input: string
}

interface PeopleProps {
    users: User[]
    input: string
    activeUsers?: string[]
    gotoDMChannel?: Function
    currentUser?: string
    tabIndex?: number
}

export const Home = ({ searchChange, input }: Props) => {
    const { channelData, channelMembers } = useContext(ChannelContext)
    const { currentUser } = useContext(UserContext)
    const peer = Object.keys(channelMembers).filter((member) => member !== currentUser)[0]
    const style = { paddingBottom: 2, paddingTop: 2 }
    const { isOpen: isGlobalSearchModalOpen, onOpen: onGlobalSearchModalOpen, onClose: onGlobalSearchModalClose } = useDisclosure()
    const [inFilter, setInFilter] = useState<string>()

    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='messages, files, people and more' tabIndex={0} />
            <Command.Group style={style}>
                {channelData && <Item
                    onSelect={() => {
                        onGlobalSearchModalOpen()
                        setInFilter(channelData.name)
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
            {!input &&
                <Command.Group heading="I'm looking for..." style={style}>
                    <HStack spacing={2} pl={2}>
                        <Item
                            onSelect={() => {
                                searchChange('messages')
                            }}>
                            <TbMessages fontSize={20} />
                            Messages
                        </Item>
                        <Item
                            onSelect={() => {
                                searchChange('files')
                            }}>
                            <TbFiles fontSize={20} />
                            Files
                        </Item>
                        <Item
                            onSelect={() => {
                                searchChange('channels')
                            }}>
                            <TbHash fontSize={20} />
                            Channels
                        </Item>
                        <Item
                            onSelect={() => {
                                searchChange('people')
                            }}>
                            <TbUsers fontSize={20} />
                            People
                        </Item>
                    </HStack>
                </Command.Group>}
            <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={0} input={input} inFilter={inFilter} />
        </Command.List>
    )
}

export const Messages = ({ searchChange, input }: Props) => {
    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='messages' tabIndex={0} />
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

export const Files = ({ searchChange, input }: Props) => {

    const { data, isValidating } = useFrappeGetCall<{ message: GetFileSearchResult[] }>("raven.api.search.get_search_result", {
        filter_type: 'File',
        doctype: 'Raven Message',
        search_text: input,
        page_length: 5
    })

    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='files' tabIndex={1} />
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
                {data?.message?.map(f => <Item key={f.name}
                ><HStack spacing={3}>
                        <Center maxW='50px'>
                            {f.message_type === 'File' && <Icon as={getFileExtensionIcon(f.file.split('.')[1])} boxSize="6" />}
                            {f.message_type === 'Image' && <Image src={f.file} alt='File preview' boxSize={6} rounded='md' fit='cover' />}
                        </Center>
                        <Stack spacing={0}>
                            {f.file && <Link fontSize='sm' href={f.file} isExternal>{f.file.split('/')[3]}</Link>}
                        </Stack>
                    </HStack></Item>)}
            </Command.Group>
        </Command.List>
    )
}

export const Channels = ({ input }: { input: string }) => {

    const { data, isValidating } = useSearch('Raven Channel', input, [["is_direct_message", "=", "0"]], 20)
    const navigate = useNavigate()
    const { onClose } = useModalContext()

    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='channels' tabIndex={2} />
            <Command.Group heading={data?.results?.length ? "Recent channels" : ""} >
                {isValidating && !data?.results?.length && <Text py='4' color='gray.500' textAlign='center' fontSize='sm'>No results found.</Text>}
                {isValidating && <Command.Loading>
                    <Center px='4' pb='2'>
                        <Box><Spinner size={'xs'} color='gray.400' /></Box>
                    </Center>
                </Command.Loading>}
                {data?.results?.map(r => <Item key={r.value} value={r.value} onSelect={() => {
                    navigate(`/channel/${r.value}`)
                    onClose()
                }}>{r.description.includes("Private") && <BiLockAlt /> || r.description.includes("Public") && <BiHash /> || r.description.includes("Open") && <BiGlobe />}{r.label}</Item>)}
            </Command.Group>
        </Command.List>
    )
}

export const People = ({ input, users, activeUsers, gotoDMChannel, currentUser }: PeopleProps) => {
    const results_count = users.reduce((count, user) => {
        if (user.full_name.toLowerCase().includes(input.toLowerCase())) {
            return count + 1;
        }
        return count;
    }, 0)
    return <Command.List>
        <Command.Empty>
            <Text>No results found.</Text>
        </Command.Empty>
        <Command.Group heading={results_count > 0 ? "Recent direct messages" : ""} >
            {users.map(user => {
                if (user.full_name.toLowerCase().includes(input.toLowerCase())) {
                    return (
                        gotoDMChannel && activeUsers &&
                        <Item key={user.name}
                            onSelect={() => {
                                gotoDMChannel(user.name)
                            }}>
                            <HStack p='2' spacing={3}>
                                <Avatar size='sm' src={user.user_image} name={user.full_name} borderRadius='md' />
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

export const FindIn = ({ input, tabIndex }: { input: string, tabIndex: number }) => {
    const { data, isValidating } = useSearch('Raven Channel', input, [["is_direct_message", "=", "0"]], 20)
    const { isOpen: isGlobalSearchModalOpen, onOpen: onGlobalSearchModalOpen, onClose: onGlobalSearchModalClose } = useDisclosure()
    const [inFilter, setInFilter] = useState<string>()
    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='messages' tabIndex={0} />
            <Command.Group heading={data?.results?.length ? "Recent channels" : ""} >
                {isValidating && !data?.results?.length && <Text py='4' color='gray.500' textAlign='center' fontSize='sm'>No results found.</Text>}
                {isValidating && <Command.Loading>
                    <Center px='4' pb='2'>
                        <Box><Spinner size={'xs'} color='gray.400' /></Box>
                    </Center>
                </Command.Loading>}
                {data?.results?.map(r => <Item key={r.value} value={r.value} onSelect={() => {
                    onGlobalSearchModalOpen()
                    setInFilter(r.value)
                }}>{r.description.includes("Private") && <BiLockAlt /> || r.description.includes("Public") && <BiHash /> || r.description.includes("Open") && <BiGlobe />}{r.label}</Item>)}
            </Command.Group>
            <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={tabIndex} input={""} inFilter={inFilter} />
        </Command.List>
    )
}

export const FindFrom = ({ input, users, tabIndex }: PeopleProps) => {
    const { isOpen: isGlobalSearchModalOpen, onOpen: onGlobalSearchModalOpen, onClose: onGlobalSearchModalClose } = useDisclosure()
    const results_count = users.reduce((count, user) => {
        if (user.full_name.toLowerCase().includes(input.toLowerCase())) {
            return count + 1;
        }
        return count;
    }, 0)
    const [fromFilter, setFromFilter] = useState<string>()
    return (
        <Command.List>
            <CommandPaletteEmptyState input={input} placeholder='messages' tabIndex={0} />
            <Command.Group heading={results_count > 0 ? "Recent direct messages" : ""} >
                {users.map(user => {
                    if (user.full_name.toLowerCase().includes(input.toLowerCase())) {
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
            {tabIndex != undefined && <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={tabIndex} input={""} fromFilter={fromFilter} />}
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
            value={value}>
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

export const LoadOptions = ({ doctype, input, filters }: { doctype: string, input: string, filters?: Filter[] }) => {

    const { data, isValidating } = useSearch(doctype, input, filters, 20)
    const navigate = useNavigate()
    const { onClose } = useModalContext()

    return (
        <Command.List>
            {isValidating && !data?.results?.length && <Text py='4' color='gray.500' textAlign='center' fontSize='sm'>No results found.</Text>}
            {isValidating && <Command.Loading>
                <Center px='4' pb='2'>
                    <Box><Spinner size={'xs'} color='gray.400' /></Box>
                </Center>
            </Command.Loading>}
            {data?.results?.map(r => <Item key={r.value} value={r.value} onSelect={() => {
                switch (doctype) {
                    case 'Raven Channel':
                        navigate(`/channel/${r.value}`)
                        break
                    case 'User':
                        navigate(`/channel/`)
                        break
                    default:
                        break
                }
                onClose()
            }}>{doctype == "Raven Message" ? <MarkdownRenderer content={r.description} /> : (r.label ? r.label : r.description)}</Item>)}
        </Command.List>
    )
}

export const CommandPaletteEmptyState = ({ input, placeholder, tabIndex }: { input: string, placeholder: string, tabIndex: number }) => {
    const { isOpen: isGlobalSearchModalOpen, onOpen: onGlobalSearchModalOpen, onClose: onGlobalSearchModalClose } = useDisclosure()
    return (
        <Command.Empty>
            <Button w='full' fontWeight="light" variant='ghost' alignContent='end' onClick={() => {
                onGlobalSearchModalOpen()
            }}>{input} - Search {placeholder}</Button>
            <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={tabIndex} input={input} />
        </Command.Empty>
    )
}
