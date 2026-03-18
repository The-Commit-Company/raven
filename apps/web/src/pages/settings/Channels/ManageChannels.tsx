import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { DataTable } from "@components/common/DataTable/DataTable"
import { CreateChannelForm } from "@components/features/channel/CreateChannel/CreateChannelForm"
import SettingsContentContainer from "@components/features/settings/SettingsContentContainer"
import { Button } from "@components/ui/button"
import { Dialog, DialogTrigger, DialogContent } from "@components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu"
import { useChannels } from "@hooks/useChannels"
import _ from "@lib/translate"
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"
import { ChannelListItem } from "@raven/types/common/ChannelListItem"
import { useFrappeCreateDoc, useFrappePostCall } from "frappe-react-sdk"
import { Bell, BellOff, BellRing, Loader2, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { ColumnDef, SortingState } from "src/types/DataTable"
import { ChannelFilters } from "./ChannelFilters"
import { useWorkspaces } from "@hooks/useWorkspaces"
import { ScrollArea } from "@components/ui/scroll-area"

export const ManageChannels = () => {

    const { channels, mutate } = useChannels()
    const { workspaces } = useWorkspaces()
    const [sorting, setSorting] = useState<SortingState | null>(null)
    const [filters, setFilters] = useState<{ myChannels: string, channelType: string, workspace: string }>({ myChannels: 'All Channels', channelType: 'All Types', workspace: workspaces?.[0]?.name ?? '' })

    const navigate = useNavigate()

    const filteredChannels = useMemo<ChannelListItem[]>(() => {
        let filteredChannels: ChannelListItem[] = channels.filter((channel) => {
            const myChannelsMatch = filters?.myChannels === 'All Channels' || (filters?.myChannels === 'Joined Channels' && !!channel.member_id) || (filters?.myChannels === 'Other Channels' && !channel.member_id);

            const channelTypeMatch = filters?.channelType === 'All Types' || channel.type === filters?.channelType;

            const workspaceMatch = !filters?.workspace || channel.workspace === filters?.workspace;

            return myChannelsMatch && channelTypeMatch && workspaceMatch;
        });

        if (!sorting) return filteredChannels
        const { field, order } = sorting
        return filteredChannels.sort((a, b) => {
            const aVal = a[field as keyof ChannelListItem] ?? ''
            const bVal = b[field as keyof ChannelListItem] ?? ''
            const cmp = aVal.localeCompare(bVal)
            return order === 'desc' ? -cmp : cmp
        })
    }, [channels, sorting, filters])

    const columns: ColumnDef<ChannelListItem>[] = [
        {
            id: 'channel_name',
            header: _('Name'),
            accessorKey: 'channel_name',
            enableSorting: true,
            headerClassName: 'w-[20%]',
            cell: ({ row }) => (
                <div className='flex items-center gap-2 hover:cursor-pointer w-full' onClick={() => navigate(`/${row.workspace}/channel/${row.name}`)}>
                    <ChannelIcon
                        type={row.type || "Public"}
                        className="w-4 h-4 shrink-0"
                    />
                    <span className='text-sm font-medium line-clamp-1 text-ellipsis'>{row.channel_name}</span>
                </div>
            )
        },
        {
            id: 'channel_description',
            header: _('Description'),
            accessorKey: 'channel_description',
            enableSorting: false,
            headerClassName: 'w-[65%]',
            cell: ({ value }) => (
                <span className='text-sm text-muted-foreground line-clamp-1 text-ellipsis'>
                    {value as string || '—'}
                </span>
            )
        },
        {
            id: 'channel_joined',
            enableSorting: false,
            accessorKey: 'member_id',
            cellClassName: 'w-0',
            cell: ({ row }) => { return row.type !== 'Open' ? <ChannelJoinButton channel={row} mutate={mutate} /> : null }
        },
        {
            id: 'allow_notifications',
            accessorKey: 'allow_notifications',
            enableSorting: false,
            cell: ({ row }) => (
                <ChannelNotificationsButton channel={row} mutate={mutate} />
            )
        }
    ]

    return (
        <SettingsContentContainer
            title={_("Channels")}
            description={_("Manage channels you have access to.")}
            actions={<CreateChannelButton selectedWorkspace={filters?.workspace ?? ''} />}
        >
            <div className="flex items-center justify-between">
                <ChannelFilters filters={filters} setFilters={setFilters} workspaces={workspaces} />
            </div>
            <ScrollArea className="h-[calc(100vh-220px)]">
                <DataTable
                    columns={columns}
                    data={filteredChannels}
                    getRowId={(row) => row.name}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    tableClassName="table-fixed"
                />
            </ScrollArea>
        </SettingsContentContainer>
    )
}

const ChannelJoinButton = ({ channel, mutate }: { channel: ChannelListItem, mutate: () => void }) => {

    const { call, loading: deletingDoc, error: leaveChannelError } = useFrappePostCall('raven.api.raven_channel.leave_channel')
    const { myProfile } = useCurrentRavenUser()

    const { createDoc, error: joinChannelError, loading: joinChannelLoading } = useFrappeCreateDoc()

    const isLoading = deletingDoc || joinChannelLoading

    const joinChannel = async () => {
        return createDoc('Raven Channel Member', {
            channel_id: channel?.name,
            user_id: myProfile?.name ?? ''
        }).then(() => {
            mutate()
        })
    }

    const leaveChannel = async () => {
        return call({ channel_id: channel?.name }).then(() => {
            mutate()
        })
    }

    const toggleJoin = (action: 'join' | 'leave') => {
        if (action === 'join') {
            return joinChannel()
        } else {
            return leaveChannel()
        }
    }

    return (
        <Button variant="outline" size="sm" className="group/join hover:cursor-pointer w-20" onClick={() => toggleJoin(channel.member_id ? 'leave' : 'join')}>
            {isLoading ? (<span className="grid">
                <Loader2 className="h-4 w-4 animate-spin text-foreground/80" aria-hidden />
            </span>) : channel.member_id ? (<span className="grid">
                <span className='text-sm font-medium opacity-100 group-hover/join:opacity-0 transition-opacity duration-150 col-start-1 row-start-1'>
                    {_('Joined')}
                </span>
                <span className='text-sm font-medium opacity-0 group-hover/join:opacity-100 transition-opacity duration-150 col-start-1 row-start-1'>
                    {_('Leave')}
                </span>
            </span>) : (<span className='text-sm font-medium'>
                {_('Join')}
            </span>)}
        </Button>
    )
}

const ChannelNotificationsButton = ({ channel, mutate }: { channel: ChannelListItem, mutate: () => void }) => {

    // TODO: Once we have the options in DocType, wire them up here

    const NotificationIcon = ({ notification }: { notification: 'All' | 'Mentions Only' | 'Mute' }) => {
        switch (notification) {
            case 'All':
                return <BellRing className="h-3 w-3 text-foreground/80" />
            case 'Mentions Only':
                return <Bell className="h-3 w-3 text-foreground/80" />
            case 'Mute':
                return <BellOff className="h-3 w-3 text-foreground/80" />
        }
    }

    if (!channel.member_id) {
        return null
    }

    return (
        <div className="flex w-full justify-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:cursor-pointer h-7 w-7 rounded-sm">
                        <span key={channel.allow_notifications ? 'on' : 'off'} className="grid">
                            <NotificationIcon notification={channel.allow_notifications ? 'All' : 'Mute'} />
                        </span>
                        <span className="sr-only">{channel.allow_notifications ? _('Mute Channel') : _('Unmute Channel')}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                    <DropdownMenuItem onClick={() => { }}>
                        <div className="flex items-center gap-2">
                            <BellRing className="h-3 w-3 text-foreground/80" />
                            <span>{_("All Notifications")}</span>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { }}>
                        <div className="flex items-center gap-2">
                            <Bell className="h-3 w-3 text-foreground/80" />
                            <span>{_("Mentions Only")}</span>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { }}>
                        <div className="flex items-center gap-2">
                            <BellOff className="h-3 w-3 text-foreground/80" />
                            <span>{_("Mute Channel")}</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

const CreateChannelButton = ({ selectedWorkspace }: { selectedWorkspace: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    className="h-8 text-xs gap-1"
                >
                    <Plus className="h-4 w-4" />
                    {_("Create Channel")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[680px] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
                <CreateChannelForm onClose={() => setIsOpen(false)} selectedWorkspace={selectedWorkspace} />
            </DialogContent>
        </Dialog>
    )
}