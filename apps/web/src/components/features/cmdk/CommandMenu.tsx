import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@components/ui/dialog'
import { Drawer, DrawerContent } from '@components/ui/drawer'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@components/ui/command'
import _ from '@lib/translate'
import { useDebounce } from '@raven/lib/hooks/useDebounce'
import { defaultFilter } from 'cmdk'
import React, { useEffect, useState } from 'react'
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
import { useLocation, useParams } from 'react-router-dom'

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
    const location = useLocation()
    const channelID = useCurrentChannelID()
    const { channel, dmChannel } = useChannel(channelIDFromURL ? channelID : "")
    const { data: peerUser } = useUser(dmChannel?.peer_user_id || "")
    const isDMRoute = location.pathname.startsWith('/dm-channel') && !channelIDFromURL

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
                onValueChange={(v) => setText(v.slice(0, 140))}
                maxLength={140}
                placeholder={_("Search or type a command")}
            />
            <CommandList className={inDrawer ? "flex-1 overflow-auto max-h-none" : "max-h-105"}>
                <CommandGroup>
                    <CommandItem
                        onSelect={() => {
                            const params = new URLSearchParams()
                            if (text) params.set('q', text)
                            if (channelIDFromURL) params.set('channel', channelID)
                            else if (isDMRoute) params.set('is_dm', '1')
                            const qs = params.toString()
                            navigate(qs ? `/search?${qs}` : '/search')
                            setOpen(false)
                        }}
                        className='cursor-pointer min-w-0'
                    >
                        <TextSearch className="h-4 w-4 text-ink-gray-4 shrink-0" />
                        {channel ? (
                            <ScopedLabel
                                text={text}
                                templateWithText={_("Search for {0} in {1}")}
                                templateNoText={_("Search in {0}")}
                                entity={
                                    <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1">
                                        <ChannelIcon type={channel.type} className="h-4 w-4 shrink-0" />
                                        <span className="font-medium text-ink-gray-8">{channel.channel_name}</span>
                                    </span>
                                }
                            />
                        ) : peerUser ? (
                            <ScopedLabel
                                text={text}
                                templateWithText={_("Search for {0} in DMs with {1}")}
                                templateNoText={_("Search in DMs with {0}")}
                                entity={
                                    <span className="font-medium text-ink-gray-8 shrink-0 whitespace-nowrap">{peerUser.first_name || peerUser.name}</span>
                                }
                            />
                        ) : isDMRoute ? (
                            <ScopedLabel
                                text={text}
                                templateWithText={_("Search for {0} in {1}")}
                                templateNoText={_("Search in {0}")}
                                entity={
                                    <span className="font-medium text-ink-gray-8 shrink-0 whitespace-nowrap">{_("Direct Messages")}</span>
                                }
                            />
                        ) : (
                            <ScopedLabel
                                text={text}
                                templateWithText={_("Search for {0}")}
                                templateNoText={_("Search")}
                            />
                        )}
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

interface ScopedLabelProps {
    text: string
    /** Translatable template used when query text is present, e.g. "Search for {0} in DMs with {1}". {0} = query, {1} = entity. */
    templateWithText: string
    /** Translatable template used when query text is empty, e.g. "Search in DMs with {0}". {0} = entity. Pass empty string when there is no entity (global option). */
    templateNoText: string
    /** Entity node (channel, peer, workspace name, etc.). May be null for global search. */
    entity?: React.ReactNode
}

function ScopedLabel({ text, templateWithText, templateNoText, entity }: ScopedLabelProps) {
    const nodes = text
        ? interpolate(templateWithText, [
            <span key="q" className="truncate min-w-0">{`\`${text}\``}</span>,
            entity,
        ])
        : interpolate(templateNoText, [entity])
    return <div className="flex gap-1 items-center min-w-0 flex-1">{nodes}</div>
}

/** Split a `{n}`-style template and interpolate JSX nodes at each placeholder position. */
function interpolate(template: string, nodes: React.ReactNode[]): React.ReactNode[] {
    return template.split(/\{(\d+)\}/g).map((part, i) => {
        if (i % 2 === 1) {
            return <React.Fragment key={i}>{nodes[Number(part)] ?? null}</React.Fragment>
        }
        const trimmed = part.trim()
        return trimmed ? <span key={i} className="shrink-0 whitespace-nowrap">{trimmed}</span> : null
    })
}

export default CommandMenu
