import { ChannelFilter } from './ChannelFilter'
import { UserFilter } from './UserFilter'
import { ClearFiltersButton } from './ClearFiltersButton'
import { ActiveFilterBadges } from './ActiveFilterBadges'
import DateFilter from './DateFilter'
import { Button } from '@components/ui/button'
import { ListFilter } from 'lucide-react'
import { RavenChannel } from '@raven/types/RavenChannelManagement/RavenChannel'
import { UserFields } from '@raven/types/common/UserFields'
import { SearchFilters as SearchFiltersType } from './types'
interface SearchFiltersProps {
    filters: SearchFiltersType,
    availableChannels: RavenChannel[],
    availableUsers: UserFields[],
    onOpenMoreFilters: () => void
}
export function SearchFilters({ filters, availableChannels, availableUsers = [], onOpenMoreFilters }: SearchFiltersProps) {
    return (
        <div className="space-y-2">
            {/* Filter Controls */}
            <div className="flex flex-row items-end gap-2">
                <UserFilter
                    filters={filters}
                    availableUsers={availableUsers}
                    showLabel={false}
                    size="sm"
                />
                <ChannelFilter
                    filters={filters}
                    availableChannels={availableChannels}
                    availableUsers={availableUsers}
                    showLabel={false}
                    size="sm"
                />
                <DateFilter
                    className="flex-shrink-0"
                    dropdownClassName="w-[260px]"
                    value={filters.dateRange}
                    onValueChange={(range) => console.log('dateRange', range)}
                    showLabel={false}
                    size="sm"
                />
                <Button variant="ghost" onClick={onOpenMoreFilters} className="text-xs font-semibold h-7 px-2 rounded-md gap-1.5">
                    <ListFilter className="w-1 h-1 mr-0.5" />
                    Filters
                </Button>
                {filters.selectedChannel !== '' || filters.selectedUser !== '' || filters.channelType !== '' || filters.dateRange.from !== undefined || filters.dateRange.to !== undefined && <ClearFiltersButton />}
            </div>
            {/* Active Filter Badges */}
            <ActiveFilterBadges
                filters={filters}
                availableChannels={availableChannels}
                availableUsers={availableUsers}
            />
        </div>
    )
} 