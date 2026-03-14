import { ChannelSelect } from "@components/common/ChannelSelect/ChannelSelect"
import { SearchFilters } from "./types"
import type { RavenChannel } from "@raven/types/RavenChannelManagement/RavenChannel"
import type { ChannelListItem, DMChannelListItem } from "@raven/types/common/ChannelListItem"
import type { UserFields } from "@raven/types/common/UserFields"

interface ChannelFilterProps {
    filters: SearchFilters
    availableChannels: RavenChannel[]
    availableUsers: UserFields[]
    onChannelChange?: (value: string) => void
    showLabel?: boolean
    size?: "sm"
    dropdownClassName?: string
}

export function ChannelFilter({
    filters,
    availableChannels,
    availableUsers,
    onChannelChange,
    showLabel = true,
    size = "sm",
    dropdownClassName,
}: ChannelFilterProps) {
    const channels = availableChannels.filter((c) => !c.is_direct_message) as unknown as ChannelListItem[]
    const dmChannels = availableChannels.filter((c) => c.is_direct_message) as unknown as DMChannelListItem[]

    return (
        <ChannelSelect
            channels={channels}
            dmChannels={dmChannels}
            availableUsers={availableUsers}
            value={filters.selectedChannel || "all"}
            onValueChange={(value) => onChannelChange?.(value)}
            placeholder="In"
            allowAll={true}
            allLabel="In Any Channel"
            size={size}
            dropdownClassName={dropdownClassName}
            showLabel={showLabel}
            label="Channel"
        />
    )
}
