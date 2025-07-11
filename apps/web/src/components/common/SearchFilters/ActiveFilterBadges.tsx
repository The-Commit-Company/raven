import { X } from 'lucide-react'
import { Badge } from '@components/ui/badge'
import { FilterComponentProps } from './types'
import { clearFilter, hasActiveFilters, separateChannelsAndDMs, getDMUsers } from './utils'

interface FilterBadgeProps {
    label: string
    filterKey: keyof FilterComponentProps['filters']
    filters: FilterComponentProps['filters']
    onFiltersChange: FilterComponentProps['onFiltersChange']
}

function FilterBadge({ label, filterKey, filters, onFiltersChange }: FilterBadgeProps) {

    const handleRemove = () => {
        clearFilter(filters, filterKey, onFiltersChange)
    }

    return (
        <Badge
            variant="secondary"
            className="gap-1 cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={handleRemove}>
            {label}
            <X className="h-3 w-3" />
        </Badge>
    )
}

export function ActiveFilterBadges({ filters, onFiltersChange, availableChannels, availableUsers }: FilterComponentProps) {

    if (!hasActiveFilters(filters)) {
        return null
    }

    const { dms } = separateChannelsAndDMs(availableChannels)
    const dmUsers = getDMUsers(dms, availableUsers)

    return (
        <div className="flex flex-wrap gap-2">
            {filters.searchQuery && (
                <FilterBadge
                    label={`Search: "${filters.searchQuery}"`}
                    filterKey="searchQuery"
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                />
            )}

            {filters.selectedChannel !== 'all' && (
                <FilterBadge
                    label={`Channel: ${availableChannels.find(c => c.id === filters.selectedChannel)?.name}`}
                    filterKey="selectedChannel"
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                />
            )}

            {filters.selectedUser !== 'all' && (
                <FilterBadge
                    label={`User: ${dmUsers.find(u => u.id === filters.selectedUser)?.user.full_name}`}
                    filterKey="selectedUser"
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                />
            )}

            {filters.channelType !== 'all' && (
                <FilterBadge
                    label={`Type: ${filters.channelType}`}
                    filterKey="channelType"
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                />
            )}

            {filters.messageType !== 'all' && (
                <FilterBadge
                    label={`Message: ${filters.messageType}`}
                    filterKey="messageType"
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                />
            )}

            {filters.fileType.length > 0 && (
                <FilterBadge
                    label={`File: ${filters.fileType.length === 1 ? filters.fileType[0].toUpperCase() : `${filters.fileType.length} types`}`}
                    filterKey="fileType"
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                />
            )}

            {(filters.dateRange.from || filters.dateRange.to) && (
                <FilterBadge
                    label={`Date: ${filters.dateRange.from && filters.dateRange.from.toLocaleDateString()}${filters.dateRange.to && ` - ${filters.dateRange.to.toLocaleDateString()}`}`}
                    filterKey="dateRange"
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                />
            )}

            {filters.isPinned === true && (
                <FilterBadge
                    label="Pinned"
                    filterKey="isPinned"
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                />
            )}

            {filters.isSaved === true && (
                <FilterBadge
                    label="Saved"
                    filterKey="isSaved"
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                />
            )}
        </div>
    )
} 