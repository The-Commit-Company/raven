import { HiOutlineSearch } from 'react-icons/hi'
import { CommandPalette } from '../command-palette'
import { useState } from 'react'
import { useModalContentStyle } from '@/hooks/useModalContentStyle'
import { Button, Dialog, Tooltip } from '@radix-ui/themes'

export const SearchButton = () => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }
    const contentClass = useModalContentStyle()

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Tooltip content='search'>
                <Dialog.Trigger>
                    <Button
                        size='2'
                        variant='outline'
                        aria-label="search">
                        <HiOutlineSearch />
                        Search
                    </Button>
                </Dialog.Trigger>
            </Tooltip>
            <Dialog.Content className={contentClass}>
                {/* <CommandPalette
                    onClose={onClose}
                    onToggle={onCommandPaletteToggle}
                /> */}
            </Dialog.Content>
        </Dialog.Root >
    )
}