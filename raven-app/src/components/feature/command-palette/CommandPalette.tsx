import React, { useContext, useEffect } from 'react'
import { Command } from 'cmdk'
import { Box, CloseButton, HStack, Link, Modal, ModalCloseButton, ModalContent, ModalOverlay, Text } from '@chakra-ui/react'
import './styles.css'
import { Home, Messages, Files, Channels, People, FindIn, FindFrom } from './CommandPaletteActions'
import { useHotkeys } from 'react-hotkeys-hook'
import { useDebounce } from '../../../hooks/useDebounce'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../../utils/auth/UserProvider'
import { Search } from 'lucide-react'
import { UserListContext } from '@/utils/users/UserListProvider'
import { ActiveUsersContext } from '@/utils/users/ActiveUsersProvider'
import { ModalTypes, useModalManager } from '@/hooks/useModalManager'
import { useTheme } from '@/ThemeProvider'

interface CommandPaletteProps {
    isOpen: boolean,
    onClose: () => void,
    onToggle: () => void,
}

export const CommandPalette = ({ isOpen, onClose, onToggle }: CommandPaletteProps) => {

    const modalManager = useModalManager()

    const onGlobalSearchModalOpen = () => {
        modalManager.openModal(ModalTypes.GlobalSearch)
    }

    const isGlobalSearchModalOpen = modalManager.modalType === ModalTypes.GlobalSearch

    const onGlobalSearchModalClose = modalManager.closeModal

    const ref = React.useRef<HTMLDivElement | null>(null)
    const [inputValue, setInputValue] = React.useState('')
    const [pages, setPages] = React.useState<string[]>([''])
    const activePage = pages[pages.length - 1]
    const lastPage = pages[pages.length - 2]
    const isHome = activePage === ''
    const debouncedText = useDebounce(inputValue, 200)
    const { currentUser } = useContext(UserContext)
    const activeUsers = useContext(ActiveUsersContext)
    const { call, reset } = useFrappePostCall<{ message: string }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.create_direct_message_channel")
    let navigate = useNavigate()

    const gotoDMChannel = async (user: string) => {
        reset()
        const result = await call({ user_id: user })
        navigate(`/channel/${result?.message}`)
    }

    const { users } = useContext(UserListContext)

    const popPage = React.useCallback(() => {
        setPages((pages) => {
            const x = [...pages]
            x.splice(-1, 1)
            return x
        })
    }, [])

    useHotkeys('meta+k, ctrl+k', onToggle, {
        enabled: true,
        preventDefault: true,
        enableOnFormTags: true,
    })

    useEffect(() => {
        setInputValue('')
        setPages([''])
    }, [isOpen])

    const { appearance } = useTheme()

    const inputRef = React.useRef<HTMLInputElement | null>(null)

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay bg='rgba(0,0,0,0.1)' />
            <ModalContent p={2} rounded='xl' shadow='xl' minW={600} bg={appearance === 'light' ? 'white' : 'gray.800'}>
                <ModalCloseButton />
                <Command aria-label="Command menu" className={appearance === 'light' ? 'palette light-theme' : 'palette dark-theme'} ref={ref}
                    onKeyDown={(e: React.KeyboardEvent) => {

                        if (isHome || debouncedText.length) {
                            return
                        }

                        if (!isGlobalSearchModalOpen && e.key === 'Backspace') {
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
                        {!activePage && <Search size={20} />}
                        <Command.Input autoFocus
                            ref={inputRef}
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
                            value={inputValue}
                            onValueChange={setInputValue} />
                    </HStack>

                    {activePage === '' && <Home input={debouncedText} searchChange={(pageChange: string) => { setInputValue(""); setPages([...pages, pageChange]) }} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} inputRef={inputRef}>
                        {users && <People input={debouncedText} users={users} activeUsers={activeUsers} gotoDMChannel={gotoDMChannel} currentUser={currentUser} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} isChild={true} />}
                        <Channels input={debouncedText} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} isChild={true} />
                    </Home>}
                    {activePage === 'messages' && <Messages input={debouncedText} searchChange={(pageChange: string) => { setInputValue(""); setPages([...pages, pageChange]) }} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />}
                    {activePage === 'files' && <Files input={debouncedText} searchChange={(pageChange: string) => { setInputValue(""); setPages([...pages, pageChange]) }} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />}
                    {activePage === 'channels' && <Channels input={debouncedText} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />}
                    {activePage === 'people' && activeUsers && users && <People input={debouncedText} users={users} activeUsers={activeUsers} gotoDMChannel={gotoDMChannel} currentUser={currentUser} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />}
                    {activePage === 'in' && lastPage && (lastPage === 'messages' ? <FindIn input={debouncedText} tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} /> : <FindIn input={debouncedText} tabIndex={1} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />)}
                    {activePage === 'from' && users && lastPage && (lastPage === 'messages' ? <FindFrom input={debouncedText} users={users} tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} /> : <FindFrom input={debouncedText} users={users} tabIndex={1} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />)}

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