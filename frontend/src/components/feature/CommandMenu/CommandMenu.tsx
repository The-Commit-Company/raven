import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { Dialog, VisuallyHidden } from '@radix-ui/themes'
import { Command, defaultFilter } from 'cmdk'
import { useEffect } from 'react'
import './commandMenu.styles.css'
import ChannelList from './ChannelList'
import UserList from './UserList'
import clsx from 'clsx'
import { atom, useAtom } from 'jotai'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent } from '@/components/layout/Drawer'
import SettingsList from './SettingsList'
import ToggleThemeCommand from './ToggleThemeCommand'

export const commandMenuOpenAtom = atom(false)

const CommandMenu = () => {
    const [open, setOpen] = useAtom(commandMenuOpenAtom)

    // Toggle the menu when ⌘K is pressed
    useEffect(() => {

        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
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
                    <VisuallyHidden>
                        <Dialog.Title>Command Menu</Dialog.Title>
                        <Dialog.Description>
                            Search or type a command
                        </Dialog.Description>
                    </VisuallyHidden>
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

    /** Use a custom filter instead of the default one - ignore very low scores in results */
    const customFilter = (value: string, search: string, keywords?: string[]) => {
        const score = defaultFilter ? defaultFilter(value, search, keywords) : 1

        if (score <= 0.1) {
            return 0
        }
        return score
    }

    return <Command label="Global Command Menu" className='command-menu' filter={customFilter}>
        <Command.Input
            autoFocus={isDesktop}
            placeholder='Search or type a command' />
        <Command.List>
            <Command.Empty>No results found.</Command.Empty>
            <ChannelList />
            <UserList />
            <SettingsList />
            <Command.Group heading="Commands">
                <ToggleThemeCommand />
            </Command.Group>

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