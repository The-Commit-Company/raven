import React, { useContext, useEffect } from 'react'
import { Command } from 'cmdk'
import './styles.css'
import { Home, Messages, Files, Channels, People, FindIn, FindFrom, PeopleGroup, ChannelGroup } from './CommandPaletteActions'
import { useDebounce } from '../../../hooks/useDebounce'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../../utils/auth/UserProvider'
import { BiSearch, BiX } from 'react-icons/bi'
import { UserListContext } from '@/utils/users/UserListProvider'
import { ActiveUsersContext } from '@/utils/users/ActiveUsersProvider'
import { ModalTypes, useModalManager } from '@/hooks/useModalManager'
import { Flex, IconButton, Box, Text, Link } from '@radix-ui/themes'

interface CommandPaletteProps {
    isOpen: boolean,
    onClose: () => void,
}

export const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {

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

    useEffect(() => {
        setInputValue('')
        setPages([''])
    }, [isOpen])

    const inputRef = React.useRef<HTMLInputElement | null>(null)

    return (
        <Command aria-label="Command menu" className='palette' ref={ref}
            onKeyDown={(e: React.KeyboardEvent) => {

                if (isHome || debouncedText.length) {
                    return
                }

                if (!isGlobalSearchModalOpen && e.key === 'Backspace') {
                    e.preventDefault()
                    popPage()
                }
            }}
            shouldFilter={isHome} loop>
            <Flex align='center' cmdk-search="">
                {pages.map((p) => (p &&
                    <Flex align='center' gap='1' key={p} cmdk-badge="">
                        {p}
                        <IconButton
                            color='gray'
                            variant='ghost'
                            className='hover:bg-transparent hover:cursor-pointer hover:text-gray-12'
                            size='1'
                            onClick={() => setPages((pages) => {
                                const x = [...pages]
                                x.length = x.indexOf(p)
                                return x
                            })}>


                            <BiX size='20' />
                        </IconButton>
                    </Flex>
                ))}
                {!activePage && <BiSearch size='18' color='var(--gray-10)' />}
                <Command.Input
                    autoFocus
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
            </Flex>

            {activePage === '' && <Home
                input={debouncedText}
                onClose={onClose}
                searchChange={(pageChange: string) => { setInputValue(""); setPages([...pages, pageChange]) }}
                isGlobalSearchModalOpen={isGlobalSearchModalOpen}
                onGlobalSearchModalOpen={onGlobalSearchModalOpen}
                onGlobalSearchModalClose={onGlobalSearchModalClose}
                inputRef={inputRef}>
                {users && <PeopleGroup onClose={onClose} input={debouncedText} users={users} activeUsers={activeUsers} gotoDMChannel={gotoDMChannel} currentUser={currentUser} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} isChild={true} />}
                <ChannelGroup onClose={onClose} input={debouncedText} isChild={true} />
            </Home>}
            {activePage === 'messages' && <Messages onClose={onClose} input={debouncedText} searchChange={(pageChange: string) => { setInputValue(""); setPages([...pages, pageChange]) }} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />}
            {activePage === 'files' && <Files onClose={onClose} input={debouncedText} searchChange={(pageChange: string) => { setInputValue(""); setPages([...pages, pageChange]) }} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />}
            {activePage === 'channels' && <Channels onClose={onClose} input={debouncedText} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />}
            {activePage === 'people' && activeUsers && users && <People onClose={onClose} input={debouncedText} users={users} activeUsers={activeUsers} gotoDMChannel={gotoDMChannel} currentUser={currentUser} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />}
            {activePage === 'in' && lastPage && (lastPage === 'messages' ? <FindIn onClose={onClose} input={debouncedText} tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} /> : <FindIn onClose={onClose} input={debouncedText} tabIndex={1} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />)}
            {activePage === 'from' && users && lastPage && (lastPage === 'messages' ? <FindFrom onClose={onClose} input={debouncedText} users={users} tabIndex={0} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} /> : <FindFrom onClose={onClose} input={debouncedText} users={users} tabIndex={1} isGlobalSearchModalOpen={isGlobalSearchModalOpen} onGlobalSearchModalOpen={onGlobalSearchModalOpen} onGlobalSearchModalClose={onGlobalSearchModalClose} />)}
            <Box cmdk-footer="" className='absolute bottom-2 right-0'>
                <Text as='p' size='1' color='gray'>Not the results that you expected? File an issue on <Link underline='hover' color='iris' href="https://github.com/The-Commit-Company/Raven" target="_blank" rel="noreferrer">
                    GitHub
                </Link>.
                </Text>
            </Box>
        </Command>
    )
}