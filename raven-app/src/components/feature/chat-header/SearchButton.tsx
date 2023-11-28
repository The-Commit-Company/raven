import { BiSearch } from 'react-icons/bi'
import { CommandPalette } from '../command-palette'
import { useState } from 'react'
import { Button, Dialog, Kbd, Tooltip } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'

export const SearchButton = () => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    const onCommandPaletteToggle = () => {
        setOpen(!open)
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
                        <BiSearch />
                        Search
                        {/* <Kbd size='3'><KeyboardMetaKeyIcon size='12' />&nbsp;K</Kbd> */}
                    </Button>
                </Dialog.Trigger>
            </Tooltip>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <CommandPalette
                    isOpen={open}
                    onClose={onClose}
                    onToggle={onCommandPaletteToggle}
                />
            </Dialog.Content>
        </Dialog.Root >
    )
}