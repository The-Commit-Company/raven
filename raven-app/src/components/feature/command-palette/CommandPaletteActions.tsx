import { Box, Button, Center, HStack, Spinner, Text, useModalContext } from "@chakra-ui/react"
import { Command } from "cmdk"
import { Filter, useFrappeGetDocList, useSearch } from "frappe-react-sdk"
import { useContext } from "react"
import { IoFileTrayFullOutline } from "react-icons/io5"
import { MdOutlineDashboard } from "react-icons/md"
import { TbFiles, TbFileSearch, TbHash, TbListSearch, TbMessages, TbReportSearch, TbUsers } from "react-icons/tb"
import { useNavigate } from "react-router-dom"
import { UserContext } from "../../../utils/auth/UserProvider"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"

interface Props {
    searchChange: Function
    input: string
}

export const Home = ({ searchChange, input }: Props) => {
    let navigate = useNavigate()
    const { channelData, channelMembers } = useContext(ChannelContext)
    const { currentUser } = useContext(UserContext)
    const { onClose } = useModalContext()
    const peer = Object.keys(channelMembers).filter((member) => member !== currentUser)[0]
    const style = { paddingBottom: 2, paddingTop: 2 }

    const onNavigate = (path: string) => {
        navigate(path)
        onClose()
    }

    return (
        <Command.List>
            <Command.Empty>
                <Button w='full' fontWeight="light" variant='ghost' alignContent='end'>{input} - Search messages, files and more</Button>
            </Command.Empty>
            {/* 
            <Command.Group heading="Messages" style={style}>
                <Item
                    // shortcut="⌘ S M"
                    onSelect={() => {
                        searchChange('messages')
                    }}
                >
                    <TbReportSearch fontSize={20} />
                    Search Messages...
                </Item>
            </Command.Group>
            <Command.Group heading="Files" style={style}>
                <Item
                    // shortcut="⌘ S T"
                    onSelect={() => {
                        searchChange('files')
                    }}
                >
                    <TbListSearch fontSize={20} />
                    Search Files...
                </Item>
            </Command.Group>
            <Command.Group heading='Channels' style={style}>
                <Item
                    // shortcut="⌘ D"
                    onSelect={() => {
                        searchChange('channels')
                    }}
                >
                    <MdOutlineDashboard fontSize={20} />
                    Search Channels...
                </Item>
            </Command.Group>

            <Command.Group heading="People" style={style}>
                <Item
                    // shortcut="⌘ S P"
                    onSelect={() => {
                        searchChange('people')
                    }}
                >
                    <TbFileSearch fontSize={20} />
                    Search People...
                </Item>
            </Command.Group> */}
            <Command.Group style={style}>
                {channelData && <Item
                    // shortcut="⌘ S T"
                    onSelect={() => {
                        searchChange('find in')
                    }}
                >
                    <TbListSearch fontSize={20} />
                    {channelData.is_direct_message ? `Find in direct messages with ${channelMembers[peer].first_name}` : `Find in ${channelData.channel_name}`}
                </Item>}
            </Command.Group>
            {!input &&
                <Command.Group heading="I'm looking for..." style={style}>
                    <HStack spacing={3}>
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
        </Command.List>
    )
}

export const Messages = ({ input }: { input: string }) => {
    return <LoadOptions doctype='Raven Message' input={input} filters={[["message_type", "=", "Text"]]} />
}

export const Files = ({ input }: { input: string }) => {
    return <LoadOptions doctype='Raven Message' input={input} filters={[["message_type", "=", "File"]]} />
}

export const Channels = ({ input }: { input: string }) => {
    return <LoadOptions doctype='Raven Channel' input={input} filters={[["is_direct_message", "=", 0]]} />
}

export const People = ({ input }: { input: string }) => {
    return <LoadOptions doctype='User' input={input} filters={[["name", "!=", "administrator"]]} />
}

export const FindIn = ({ input }: { input: string }) => {
    return <LoadOptions doctype='Raven Message' input={input} />
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
    const { channelData } = useContext(ChannelContext)

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
                    case 'Messages':
                        navigate(`/channel/`)
                        break
                    case 'Files':
                        navigate(`/channel/`)
                        break
                    case 'Channels':
                        navigate(`/channel/`)
                        break
                    case 'People':
                        navigate(`/channel/`)
                        break
                    default:

                }
                onClose()

            }}>{r.label ? r.label : r.description}</Item>)}
        </Command.List>
    )
}
