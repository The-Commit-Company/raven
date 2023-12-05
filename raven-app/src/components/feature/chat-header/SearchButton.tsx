import { BiSearch } from 'react-icons/bi'
import { CommandPalette } from '../command-palette'
import { useEffect } from 'react'
import { Button, Dialog, Tooltip } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { useBoolean } from '@/hooks/useBoolean'
import { clsx } from 'clsx'

export const SearchButton = () => {

    const [open, {
        off,
        toggle
    }, setOpen] = useBoolean(false)

    useEffect(() => {
        const down = (e: any) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                toggle()
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

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
            <Dialog.Content className={clsx(DIALOG_CONTENT_CLASS, 'p-3 min-h-[420px]')}>
                <CommandPalette
                    isOpen={open}
                    onClose={off}
                />
            </Dialog.Content>
        </Dialog.Root >
    )
}