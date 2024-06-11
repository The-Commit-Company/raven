import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { Dialog } from '@radix-ui/themes'
import { Command } from 'cmdk'
import { useEffect } from 'react'
import './commandMenu.styles.css'
import ChannelList from './ChannelList'
import UserList from './UserList'
import clsx from 'clsx'
import { BiCog, BiFile, BiMoon, BiSearch, BiSmile } from 'react-icons/bi'
import ArchivedChannelList from './ArchivedChannelList'
import { atom, useAtom } from 'jotai'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent } from '@/components/layout/Drawer'

export const commandMenuOpenAtom = atom(false)

const CommandMenu = () => {
    const [open, setOpen] = useAtom(commandMenuOpenAtom)

    // Toggle the menu when ⌘K is pressed
    useEffect(() => {

        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return (
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Content className={clsx(DIALOG_CONTENT_CLASS, 'p-4 rounded-md')}>
                    <CommandList />
                </Dialog.Content>
            </Dialog.Root>
        )
    } else {
        return <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <div className='min-h-[80vh]'>
                    <CommandList />
                </div>

            </DrawerContent>
        </Drawer>
    }






}

export const CommandList = () => {
    const isDesktop = useIsDesktop()
    return <Command label="Global Command Menu" className='command-menu'>
        <Command.Input
            autoFocus={isDesktop}
            placeholder='Search or type a command' />
        <Command.List>
            <Command.Empty>No results found.</Command.Empty>
            <ChannelList />
            <UserList />

            {/* TODO: Make these commands work */}
            {/* <Command.Group heading="Commands">
            <Command.Item>
                <BiSearch size={ICON_SIZE} />
                Search
            </Command.Item>
            <Command.Item>
                <BiSearch size={ICON_SIZE} />
                Search in #general
            </Command.Item>
            <Command.Item>
                <BiFile size={ICON_SIZE} />
                View files in #general
            </Command.Item>
            <Command.Item>
                <BiSmile size={ICON_SIZE} />
                Set status
            </Command.Item>
            <Command.Item>
                <BiMoon size={ICON_SIZE} />
                Toggle Theme
            </Command.Item>
            <Command.Item>
                <BiCog size={ICON_SIZE} />
                Settings
            </Command.Item>
        </Command.Group> */}

            {/* <ArchivedChannelList /> */}
        </Command.List>
    </Command>
}

export default CommandMenu