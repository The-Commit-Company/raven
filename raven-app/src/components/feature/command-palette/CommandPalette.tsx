import React, { useContext, useEffect } from 'react'
import { Command } from 'cmdk'
import { Box, CloseButton, HStack, Link, Modal, ModalCloseButton, ModalContent, ModalOverlay, useColorMode, Text } from '@chakra-ui/react'
import './styles.css'
import { Home, Messages, Files, Channels, People, FindIn, FindFrom } from './CommandPaletteActions'
import { useHotkeys } from 'react-hotkeys-hook'
import { useDebounce } from '../../../hooks/useDebounce'
import { useFrappeGetCall, useFrappeGetDocList, useFrappePostCall } from 'frappe-react-sdk'
import { useNavigate } from 'react-router-dom'
import { User } from '../../../types/User/User'
import { UserContext } from '../../../utils/auth/UserProvider'
import { TbSearch } from 'react-icons/tb'

interface CommandPaletteProps {
    isOpen: boolean,
    onClose: () => void,
    onToggle: () => void
}

export const CommandPalette = ({ isOpen, onClose, onToggle }: CommandPaletteProps) => {

    const ref = React.useRef<HTMLDivElement | null>(null)
    const [inputValue, setInputValue] = React.useState('')
    const [pages, setPages] = React.useState<string[]>([''])
    const activePage = pages[pages.length - 1]
    const lastPage = pages[pages.length - 2]
    const isHome = activePage === ''
    const debouncedText = useDebounce(inputValue, 200)
    const { currentUser } = useContext(UserContext)
    const { data: activeUsers, error: activeUsersError } = useFrappeGetCall<{ message: string[] }>('raven.api.user_availability.get_active_users')
    const { call, error: channelError, loading, reset } = useFrappePostCall<{ message: string }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.create_direct_message_channel")
    let navigate = useNavigate()

    const gotoDMChannel = async (user: string) => {
        reset()
        const result = await call({ user_id: user })
        navigate(`/channel/${result?.message}`)
    }

    const { data: users, error: usersError } = useFrappeGetDocList<User>("User", {
        fields: ["full_name", "user_image", "name"],
        filters: [["name", "!=", "Guest"]]
    })

    const popPage = React.useCallback(() => {
        setPages((pages) => {
            const x = [...pages]
            x.splice(-1, 1)
            return x
        })
    }, [])

    useHotkeys('meta+k', onToggle, {
        enabled: true,
        preventDefault: true,
        enableOnFormTags: true,
    })

    useEffect(() => {
        setInputValue('')
        setPages([''])
    }, [isOpen])

    const { colorMode } = useColorMode()

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay bg='rgba(0,0,0,0.1)' />
            <ModalContent p={2} rounded='xl' shadow='xl' minW={600} bg={colorMode === 'light' ? 'white' : 'gray.800'}>
                <ModalCloseButton />
                <Command aria-label="Command menu" className={colorMode === 'light' ? 'palette light-theme' : 'palette dark-theme'} ref={ref}
                    onKeyDown={(e: React.KeyboardEvent) => {

                        if (isHome || debouncedText.length) {
                            return
                        }

                        if (e.key === 'Backspace') {
                            e.preventDefault()
                            popPage()
                        }
                    }} shouldFilter={activePage === ""}>
                    <HStack cmdk-search="">
                        {pages.map((p) => (p &&
                            <Box key={p} cmdk-badge="">
                                {p}
                                <CloseButton size='sm' onClick={() => setPages((pages) => {
                                    const x = [...pages]
                                    x.length = x.indexOf(p)
                                    return x
                                })} />
                            </Box>
                        ))}
                        {!activePage && <TbSearch size={20} />}
                        <Command.Input autoFocus
                            placeholder={function () {
                                switch (activePage) {
                                    case 'messages':
                                        return "Search messages";
                                    case 'files':
                                        return "Search files";
                                    case 'channels':
                                        return "Search channels";
                                    case 'people':
                                        return "Search people";
                                    case 'in':
                                        return "Search in";
                                    case 'from':
                                        return "Search from";
                                    default:
                                        return "Search messages, files, people, etc.";
                                }
                            }()}
                            value={debouncedText}
                            onValueChange={setInputValue} />
                    </HStack>

                    {activePage === '' && <Home input={debouncedText} searchChange={(pageChange: string) => { setInputValue(""); setPages([...pages, pageChange]) }} />}
                    {activePage === 'messages' && <Messages input={debouncedText} searchChange={(pageChange: string) => { setInputValue(""); setPages([...pages, pageChange]) }} />}
                    {activePage === 'files' && <Files input={debouncedText} searchChange={(pageChange: string) => { setInputValue(""); setPages([...pages, pageChange]) }} />}
                    {activePage === 'channels' && <Channels input={debouncedText} />}
                    {activePage === 'people' && activeUsers && users && <People input={debouncedText} users={users} activeUsers={activeUsers?.message} gotoDMChannel={gotoDMChannel} currentUser={currentUser} />}
                    {activePage === 'in' && lastPage && (lastPage === 'messages' ? <FindIn input={debouncedText} tabIndex={0} /> : <FindIn input={debouncedText} tabIndex={1} />)}
                    {activePage === 'from' && users && lastPage && (lastPage === 'messages' ? <FindFrom input={debouncedText} users={users} tabIndex={0} /> : <FindFrom input={debouncedText} users={users} tabIndex={1} />)}

                    <Box cmdk-footer="">
                        <HStack spacing={1}>
                            <Text color='gray.500'>Not the results that you expected? File an issue on</Text>
                            <Link href="https://github.com/The-Commit-Company/Raven" target="_blank" rel="noreferrer">
                                <Text color='blue.500'>GitHub.</Text>
                            </Link>.
                        </HStack>
                    </Box>

                </Command>
            </ModalContent>
        </Modal>
    )
}