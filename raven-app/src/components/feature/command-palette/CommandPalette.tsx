import React, { useEffect } from 'react'
import { Command } from 'cmdk'
import { Box, Button, CloseButton, HStack, Modal, ModalCloseButton, ModalContent, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import './styles.css'
import { Home, Messages, Files, Channels, People, FindIn } from './CommandPaletteActions'
import { useHotkeys } from 'react-hotkeys-hook'
import { useDebounce } from '../../../hooks/useDebounce'

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
    const isHome = activePage === ''
    const debouncedText = useDebounce(inputValue, 200)


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

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay bg='rgba(0,0,0,0.1)' />
            <ModalContent p={2} rounded='xl' shadow='xl' minW={600}>
                <ModalCloseButton />
                <Command aria-label="Command menu" className='palette' ref={ref}
                    onKeyDown={(e: React.KeyboardEvent) => {

                        if (isHome || debouncedText.length) {
                            return
                        }

                        if (e.key === 'Backspace') {
                            e.preventDefault()
                            popPage()
                        }
                    }} shouldFilter={activePage === ""}>
                    <HStack>
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
                        <Command.Input autoFocus
                            placeholder="Search messages, files, people, etc."
                            value={debouncedText}
                            onValueChange={setInputValue} /></HStack>

                    {activePage === '' && <Home input={debouncedText} searchChange={(pageChange: string) => { setInputValue(""); setPages([...pages, pageChange]) }} />}
                    {activePage === 'messages' && <Messages input={debouncedText} />}
                    {activePage === 'files' && <Files input={debouncedText} />}
                    {activePage === 'channels' && <Channels input={debouncedText} />}
                    {activePage === 'people' && <People input={debouncedText} />}
                    {activePage === 'find in' && <FindIn input={debouncedText} />}

                </Command>
            </ModalContent>
        </Modal>
    )
}