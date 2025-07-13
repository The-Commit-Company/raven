import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectLabel, SelectGroup } from '@components/ui/select'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { FilterComponentProps, Channel } from './types'
import { updateFilter, separateChannelsAndDMs, getChannelIconType } from './utils'
import { Label } from '@components/ui/label'
import { cn } from "../../../lib/utils"

interface ChannelFilterProps extends FilterComponentProps { size?: 'sm' }

export function ChannelFilter({ filters, onFiltersChange, availableChannels, availableUsers, showLabel = true, size }: ChannelFilterProps) {

    const { channels, dms } = separateChannelsAndDMs(availableChannels)
    const selectedChannel = availableChannels.find(c => c.id === filters.selectedChannel)

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
                onValueChange={(value) => updateFilter(filters, 'selectedChannel', value, onFiltersChange)}>
                <SelectTrigger className={cn("w-fit [&>span]:text-inherit", triggerSizeClass, paddingClass)}>
                    {selectedChannel && filters.selectedChannel !== 'all' ? (
                        <div className="flex items-center gap-1">
                            {selectedChannel.is_direct_message === 1 ? (
                                (() => {
                                    const peerUser = availableUsers.find(u => u.name === selectedChannel.peer_user_id)
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
                                    type={getChannelIconType(selectedChannel.type)}
                                    className="h-4 w-4"
                                />
                            )}
                            <span className={cn("pl-0.5", labelSizeClass)}>{selectedChannel.is_direct_message === 1 ?
                                (() => {
                                    const peerUser = availableUsers.find(u => u.name === selectedChannel.peer_user_id)
                                    return peerUser?.full_name ?? selectedChannel.peer_user_id
                                })() :
                                selectedChannel.name
                            }</span>
                        </div>
                    ) : (
                        <SelectValue placeholder="In" className={cn("pl-1", labelSizeClass)} />
                    )}
                </SelectTrigger>
                <SelectContent className="w-full">
                    <SelectItem value="all">In Any Channel</SelectItem>
                    <SelectGroup>
                        <SelectLabel className="text-xs text-muted-foreground/80 px-2 py-1.5">Channels</SelectLabel>
                        {channels.map((channel: Channel) => (
                            <SelectItem key={channel.id} value={channel.id} textValue={channel.name}>
                                <div className="flex items-center gap-1">
                                    <ChannelIcon
                                        type={getChannelIconType(channel.type)}
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
                                {dms.map((dm: Channel) => {
                                    const peerUser = availableUsers.find(u => u.name === dm.peer_user_id);
                                    return (
                                        <SelectItem
                                            key={dm.id}
                                            value={dm.id}
                                            textValue={peerUser?.full_name ?? dm.peer_user_id}>
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
                                                <span className="pl-0.5">{peerUser?.full_name ?? dm.peer_user_id}</span>
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