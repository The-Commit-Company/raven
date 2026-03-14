import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import _ from "@lib/translate"
import { WorkspaceFields } from "@hooks/useWorkspaces"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"

export const ChannelFilters = ({ filters, setFilters, workspaces }: { filters: any, setFilters: (filters: any) => void, workspaces: WorkspaceFields[] }) => {
    return (
        <div className="flex items-center gap-2">
            <WorkspaceFilter filters={filters} setFilters={setFilters} workspaces={workspaces} />
            <MyChannelsFilter filters={filters} setFilters={setFilters} />
            <ChannelTypeFilter filters={filters} setFilters={setFilters} />
        </div>
    )
}

const MyChannelsFilter = ({ filters, setFilters }: { filters: any, setFilters: (filters: any) => void }) => {
    return (
        <Select
            value={filters.myChannels}
            onValueChange={(value) => setFilters({ ...filters, myChannels: value })}
        >
            <SelectTrigger className="w-52 **:data-[slot=select-value]:truncate **:data-[slot=select-value]:block">
                <SelectValue placeholder={_('Select a group')} />
            </SelectTrigger>
            <SelectContent className="min-w-52  max-w-72">
                <SelectItem value="All Channels">All Channels</SelectItem>
                <SelectItem value="Joined Channels">Joined Channels</SelectItem>
                <SelectItem value="Other Channels">Other Channels</SelectItem>
            </SelectContent>
        </Select>
    )
}

const ChannelTypeFilter = ({ filters, setFilters }: { filters: any, setFilters: (filters: any) => void }) => {

    return (
        <Select
            value={filters.channelType}
            onValueChange={(value) => setFilters({ ...filters, channelType: value })}
        >
            <SelectTrigger className="w-52 **:data-[slot=select-value]:truncate **:data-[slot=select-value]:block">
                <SelectValue placeholder={_('Select a channel type')} />
            </SelectTrigger>
            <SelectContent className="min-w-52 max-w-72">
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="Public">Public</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
            </SelectContent>
        </Select>
    )
}

const WorkspaceFilter = ({ filters, setFilters, workspaces }: { filters: any, setFilters: (filters: any) => void, workspaces: WorkspaceFields[] }) => {

    return (
        <Select
            value={filters.workspace}
            onValueChange={(value) => setFilters({ ...filters, workspace: value })}
        >
            <SelectTrigger className="w-52 **:data-[slot=select-value]:truncate **:data-[slot=select-value]:block px-1">
                <SelectValue placeholder={_('Select a workspace')} />
            </SelectTrigger>
            <SelectContent className="min-w-52 max-w-72">
                {workspaces?.map((workspace) => (
                    <SelectItem key={workspace.name} value={workspace.name} className="h-8 px-0.5">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 rounded-sm border border-border/80 dark:border-border/60">
                                <AvatarImage src={workspace.logo} alt={workspace.workspace_name} />
                                <AvatarFallback className="rounded-none">
                                    {workspace.workspace_name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {workspace.workspace_name}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}