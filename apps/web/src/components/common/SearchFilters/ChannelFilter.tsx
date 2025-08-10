import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectLabel, SelectGroup } from '@components/ui/select'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { Label } from '@components/ui/label'
import { cn } from "../../../lib/utils"
import { SearchFilters } from './types'
import { RavenChannel } from '@raven/types/RavenChannelManagement/RavenChannel'
import { UserFields } from '@raven/types/common/UserFields'
import { DMChannelListItem } from '@raven/types/common/ChannelListItem'

interface ChannelFilterProps {
    filters: SearchFilters,
    availableChannels: RavenChannel[],
    availableUsers: UserFields[],
    showLabel?: boolean,
    size?: 'sm',
    dropdownClassName?: string
}

export function ChannelFilter({ filters, availableChannels, availableUsers, showLabel = true, size, dropdownClassName }: ChannelFilterProps) {

    const channels = availableChannels.filter(c => !c.is_direct_message)
    const dms = availableChannels.filter(c => c.is_direct_message)

    const selectedChannel = availableChannels.find(c => c.name === filters.selectedChannel)

    // Determine classes based on size
    const triggerSizeClass = size === 'sm' ? '!h-7 !py-1 text-xs [&>span]:!px-0' : '!h-9 !py-2 [&>span]:!px-0'
    const labelSizeClass = size === 'sm' ? 'text-xs' : ''

    // Dynamic padding based on whether we have a selected channel with icon
    const hasSelectedIcon = selectedChannel && filters.selectedChannel !== 'all'
    const paddingClass = hasSelectedIcon ? (size === 'sm' ? '!px-2' : '!px-3') : (size === 'sm' ? '!px-3' : '!px-4')

    return (
        <div className="flex-shrink-0">
            {showLabel && <Label className="text-xs text-muted-foreground mb-1 block">Channel</Label>}
            <Select
                value={filters.selectedChannel}
                onValueChange={(value) => console.log('selectedChannel', value)}>
                <SelectTrigger className={cn("w-fit [&>span]:text-inherit", triggerSizeClass, paddingClass)}>
                    {selectedChannel && filters.selectedChannel !== 'all' ? (
                        <div className="flex items-center gap-1">
                            {selectedChannel.is_direct_message === 1 ? (
                                (() => {
                                    const dmChannel = selectedChannel as unknown as DMChannelListItem
                                    const peerUser = availableUsers.find(u => u.name === dmChannel.peer_user_id)
                                    return peerUser ? (
                                        <UserAvatar
                                            user={peerUser}
                                            size="sm"
                                            showStatusIndicator={false}
                                            showBotIndicator={false}
                                        />
                                    ) : (
                                        <span className="h-4 w-4 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">?</span>
                                    )
                                })()
                            ) : (
                                <ChannelIcon
                                    type={selectedChannel.type as 'Public' | 'Private' | 'Open'}
                                    className="h-4 w-4"
                                />
                            )}
                            <span className={cn("pl-0.5", labelSizeClass)}>{selectedChannel.is_direct_message === 1 ?
                                (() => {
                                    const dmChannel = selectedChannel as unknown as DMChannelListItem
                                    const peerUser = availableUsers.find(u => u.name === dmChannel.peer_user_id)
                                    return peerUser?.full_name ?? dmChannel.peer_user_id
                                })() :
                                selectedChannel.name
                            }</span>
                        </div>
                    ) : (
                        <SelectValue placeholder="In" className={cn("pl-1", labelSizeClass)} />
                    )}
                </SelectTrigger>
                <SelectContent className={dropdownClassName || "w-full"}>
                    <SelectItem value="all">In Any Channel</SelectItem>
                    <SelectGroup>
                        <SelectLabel className="text-xs text-muted-foreground/80 px-2 py-1.5">Channels</SelectLabel>
                        {channels.map((channel: RavenChannel) => (
                            <SelectItem key={channel.name} value={channel.name} textValue={channel.name}>
                                <div className="flex items-center gap-1">
                                    <ChannelIcon
                                        type={channel.type as 'Public' | 'Private' | 'Open'}
                                        className="h-4 w-4"
                                    />
                                    <span className="pl-0.5">{channel.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectGroup>
                    {dms.length > 0 && (
                        <>
                            <SelectSeparator />
                            <SelectGroup>
                                <SelectLabel className="text-xs text-muted-foreground/80 px-2 py-1.5">Direct Messages</SelectLabel>
                                {dms.map((dm: RavenChannel) => {
                                    const dmChannel = dm as unknown as DMChannelListItem
                                    const peerUser = availableUsers.find(u => u.name === dmChannel.peer_user_id);
                                    return (
                                        <SelectItem
                                            key={dm.name}
                                            value={dm.name}
                                            textValue={peerUser?.full_name ?? dmChannel.peer_user_id}>
                                            <div className="flex items-center gap-1">
                                                {peerUser ? (
                                                    <UserAvatar
                                                        user={peerUser}
                                                        size="sm"
                                                        showStatusIndicator={false}
                                                        showBotIndicator={false}
                                                    />
                                                ) : (
                                                    <span className="h-4 w-4 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">?</span>
                                                )}
                                                <span className="pl-0.5">{peerUser?.full_name ?? dmChannel.peer_user_id}</span>
                                            </div>
                                        </SelectItem>
                                    )
                                })}
                            </SelectGroup>
                        </>
                    )}
                </SelectContent>
            </Select>
        </div>
    )
} 