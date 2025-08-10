import { X } from 'lucide-react'
import { Badge } from '@components/ui/badge'
import { SearchFilters } from './types'
import { RavenChannel } from '@raven/types/RavenChannelManagement/RavenChannel'
import { UserFields } from '@raven/types/common/UserFields'
interface FilterBadgeProps {
    label: string
}

function FilterBadge({ label }: FilterBadgeProps) {

    const handleRemove = () => {
        console.log('remove filter')
    }

    return (
        <Badge
            variant="secondary"
            className="gap-1 text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={handleRemove}>
            {label}
            <X className="w-1 h-1" />
        </Badge>
    )
}

export function ActiveFilterBadges({ filters, availableChannels, availableUsers }: { filters: SearchFilters, availableChannels: RavenChannel[], availableUsers: UserFields[] }) {

    if (!filters) {
        return null
    }

    return (
        <div className="flex flex-wrap gap-2">
            {filters.searchQuery && (
                <FilterBadge
                    label={`Search: "${filters.searchQuery}"`}
                />
            )}

            {filters.selectedChannel !== '' && (
                <FilterBadge
                    label={`Channel: ${availableChannels.find(c => c.name === filters.selectedChannel)?.name}`}
                />
            )}

            {filters.selectedUser !== '' && (
                <FilterBadge
                    label={`User: ${availableUsers.find(u => u.name === filters.selectedUser)?.full_name}`}
                />
            )}

            {filters.channelType !== '' && (
                <FilterBadge
                    label={`Type: ${filters.channelType}`}
                />
            )}

            {filters.messageType !== '' && (
                <FilterBadge
                    label={`Message: ${filters.messageType}`}
                />
            )}

            {filters.fileType.length > 0 && (
                <FilterBadge
                    label={`File: ${filters.fileType.length === 1 ? filters.fileType[0].toUpperCase() : `${filters.fileType.length} types`}`}
                />
            )}

            {(filters.dateRange.from || filters.dateRange.to) && (
                <FilterBadge
                    label={`Date: ${filters.dateRange.from && filters.dateRange.from.toLocaleDateString()}${filters.dateRange.to && ` - ${filters.dateRange.to.toLocaleDateString()}`}`}
                />
            )}

            {filters.isPinned === true && (
                <FilterBadge
                    label="Pinned"
                />
            )}

            {filters.isSaved === true && (
                <FilterBadge
                    label="Saved"
                />
            )}
        </div>
    )
} 