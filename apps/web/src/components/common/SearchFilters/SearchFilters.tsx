import { SearchFiltersProps } from './types'
import { ChannelFilter } from './ChannelFilter'
import { UserFilter } from './UserFilter'
import { ClearFiltersButton } from './ClearFiltersButton'
import { ActiveFilterBadges } from './ActiveFilterBadges'
import DateFilter from './DateFilter'
import { Button } from '@components/ui/button'
import { ListFilter } from 'lucide-react'

interface SearchFiltersWithDrawerProps extends SearchFiltersProps {
    onOpenMoreFilters: () => void;
}

export function SearchFilters({ filters, onFiltersChange, availableChannels, availableUsers = [], onOpenMoreFilters }: SearchFiltersWithDrawerProps) {
    return (
        <div className="space-y-2">
            {/* Filter Controls */}
            <div className="flex flex-row items-end gap-2">
                <UserFilter
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    availableChannels={availableChannels}
                    availableUsers={availableUsers}
                    showLabel={false}
                    size="sm"
                />
                <ChannelFilter
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    availableChannels={availableChannels}
                    availableUsers={availableUsers}
                    showLabel={false}
                    size="sm"
                />
                <DateFilter
                    className="flex-shrink-0"
                    dropdownClassName="w-[260px]"
                    value={filters.dateRange}
                    onValueChange={(range) => onFiltersChange({ ...filters, dateRange: range })}
                    showLabel={false}
                    size="sm"
                />
                <Button variant="ghost" onClick={onOpenMoreFilters} className="text-xs font-semibold h-7 px-2 rounded-md gap-1.5">
                    <ListFilter className="w-1 h-1 mr-0.5" />
                    Filters
                </Button>
                <ClearFiltersButton
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    availableChannels={availableChannels}
                    availableUsers={availableUsers}
                />
            </div>
            {/* Active Filter Badges */}
            <ActiveFilterBadges
                filters={filters}
                onFiltersChange={onFiltersChange}
                availableChannels={availableChannels}
                availableUsers={availableUsers}
            />
        </div>
    )
} 