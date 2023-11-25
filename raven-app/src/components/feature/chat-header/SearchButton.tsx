import { HiOutlineSearch } from 'react-icons/hi'
import { CommandPalette } from '../command-palette'
import { useState } from 'react'
import { Button, Dialog, Tooltip } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'

export const SearchButton = () => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Tooltip content='search'>
                <Dialog.Trigger>
                    <Button
                        color='gray'
                        size='2'
                        variant='soft'
                        aria-label="search">
                        <HiOutlineSearch />
                        Search
                    </Button>
                </Dialog.Trigger>
            </Tooltip>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                {/* <CommandPalette
                    onClose={onClose}
                    onToggle={onCommandPaletteToggle}
                /> */}
            </Dialog.Content>
        </Dialog.Root >
    )
}