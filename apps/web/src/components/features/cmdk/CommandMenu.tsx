import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@components/ui/dialog'
import { Drawer, DrawerContent } from '@components/ui/drawer'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@components/ui/command'
import _ from '@lib/translate'
import { useDebounce } from '@raven/lib/hooks/useDebounce'
import { defaultFilter } from 'cmdk'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextSearch } from 'lucide-react'
import { useAtom, useSetAtom } from 'jotai'
import ChannelList from './ChannelList'
import UserList from './UserList'
import SettingsList from './SettingsList'
import QuickActions from './CommandList'
import { commandMenuOpenAtom } from './atoms'
import { useCurrentChannelID } from '@hooks/useCurrentChannelID'
import { useChannel } from '@hooks/useChannel'
import { useUser } from '@hooks/useUser'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import { useIsMobile } from '@hooks/use-mobile'
import { useParams } from 'react-router-dom'

const CommandMenu = () => {
    const [open, setOpen] = useAtom(commandMenuOpenAtom)
    const isMobile = useIsMobile()

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

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerContent className="h-[90vh] flex flex-col">
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                        <CommandPalette inDrawer />
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className="fixed left-1/2 top-1.25 -translate-x-1/2 translate-y-0 w-155 max-w-none sm:max-w-none p-0 gap-0 overflow-hidden [&>button:last-child]:hidden"
                aria-describedby={undefined}
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>{_("Command Menu")}</DialogTitle>
                    <DialogDescription>{_("Search or type a command")}</DialogDescription>
                </DialogHeader>
                <CommandPalette />
            </DialogContent>
        </Dialog>
    )
}

const CommandPalette = ({ inDrawer = false }: { inDrawer?: boolean }) => {
    const [text, setText] = useState('')
    const navigate = useNavigate()
    const setOpen = useSetAtom(commandMenuOpenAtom)
    const { workspaceID, id: channelIDFromURL } = useParams()
    const channelID = useCurrentChannelID()
    const { channel, dmChannel } = useChannel(channelIDFromURL ? channelID : "")
    const { data: peerUser } = useUser(dmChannel?.peer_user_id || "")

    const debouncedText = useDebounce(text, 200)

    const customFilter = (value: string, search: string, keywords?: string[]) => {
        const score = defaultFilter ? defaultFilter(value, search, keywords) : 1
        if (score <= 0.1) return 0
        return score
    }

    return (
        <Command
            label="Global Command Menu"
            filter={customFilter}
            shouldFilter={false}
            className={inDrawer ? "flex flex-col flex-1 min-h-0 bg-transparent" : ""}
        >
            <CommandInput
                autoFocus
                value={text}
                onValueChange={setText}
                placeholder={_("Search or type a command")}
            />
            <CommandList className={inDrawer ? "flex-1 overflow-auto max-h-none" : "max-h-105"}>
                <CommandGroup>
                    <CommandItem
                        onSelect={() => {
                            const params = new URLSearchParams()
                            if (text) params.set('q', text)
                            if (channelIDFromURL) params.set('channel', channelID)
                            const qs = params.toString()
                            navigate(qs ? `/search?${qs}` : '/search')
                            setOpen(false)
                        }}
                        className='cursor-pointer'
                    >
                        <TextSearch className="h-4 w-4 text-ink-gray-4" />
                        {channel ? (
                            <div className="flex gap-1 items-center">
                                {text ? _("Search for `{0}` in", [text]) : _("Search in")}
                                <ChannelIcon type={channel.type} className="h-4 w-4" />
                                <span className="font-medium text-ink-gray-8">{channel.channel_name}</span>
                            </div>
                        ) : peerUser ? (
                            <div className="flex gap-1 items-center">
                                {text ? _("Search for `{0}` in DMs with", [text]) : _("Search in DMs with")}
                                <span className="font-medium text-ink-gray-8">{peerUser.first_name || peerUser.name}</span>
                            </div>
                        ) : workspaceID ? (
                            <div className="flex gap-1 items-center">
                                {text ? _("Search for `{0}` in", [text]) : _("Search in")}
                                <span className="font-medium text-ink-gray-8">{decodeURIComponent(workspaceID)}</span>
                            </div>
                        ) : null}
                    </CommandItem>
                </CommandGroup>

                <ChannelList text={debouncedText} />
                <UserList text={debouncedText} />
                <SettingsList text={debouncedText} />
                <QuickActions text={debouncedText} />

                <CommandEmpty>
                    {_("No results found.")}
                </CommandEmpty>
            </CommandList>
        </Command>
    )
}

export default CommandMenu
