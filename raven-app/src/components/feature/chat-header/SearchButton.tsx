import { Tooltip, Button } from '@chakra-ui/react'
import { HiOutlineSearch } from 'react-icons/hi'
import { CommandPalette } from '../command-palette'
import { ModalTypes, useModalManager } from '@/hooks/useModalManager'

export const SearchButton = () => {

    const modalManager = useModalManager()

    const onCommandPaletteOpen = () => {
        modalManager.openModal(ModalTypes.CommandPalette)
    }

    const onCommandPaletteToggle = () => {
        modalManager.toggleModal(ModalTypes.CommandPalette)
    }

    return (
        <>
            <Tooltip hasArrow label='search' placement='bottom-start' rounded={'md'}>
                <Button
                    size={"sm"}
                    aria-label="search"
                    leftIcon={<HiOutlineSearch />}
                    onClick={onCommandPaletteOpen}
                    fontWeight='light'>
                    Search
                </Button>
            </Tooltip>
            <CommandPalette
                isOpen={modalManager.modalType === ModalTypes.CommandPalette}
                onClose={modalManager.closeModal}
                onToggle={onCommandPaletteToggle}
            />
        </>
    )
}