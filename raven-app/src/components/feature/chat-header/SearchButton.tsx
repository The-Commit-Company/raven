import { Tooltip, Button, useDisclosure } from '@chakra-ui/react'
import { HiOutlineSearch } from 'react-icons/hi'
import { CommandPalette } from '../command-palette'

export const SearchButton = () => {

    const { isOpen: isCommandPaletteOpen, onClose: onCommandPaletteClose, onToggle: onCommandPaletteToggle } = useDisclosure()

    return (
        <>
            <Tooltip hasArrow label='search' placement='bottom-start' rounded={'md'}>
                <Button
                    size={"sm"}
                    aria-label="search"
                    leftIcon={<HiOutlineSearch />}
                    onClick={onCommandPaletteToggle}
                    fontWeight='light'>
                    Search
                </Button>
            </Tooltip>
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={onCommandPaletteClose}
                onToggle={onCommandPaletteToggle} />
        </>
    )
}