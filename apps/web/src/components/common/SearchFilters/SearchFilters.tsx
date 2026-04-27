import { ChannelSelect } from '@components/common/ChannelSelect/ChannelSelect'
import { UserFilter } from './UserFilter'
import { ClearFiltersButton } from './ClearFiltersButton'
import { ActiveFilterBadges } from './ActiveFilterBadges'
import DateFilter from './DateFilter'
import { Button } from '@components/ui/button'
import { ListFilter } from 'lucide-react'
import { SearchFilters as SearchFiltersType } from './types'
import { ChannelListItem, DMChannelListItem } from '@raven/types/common/ChannelListItem'
import _ from '@lib/translate'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@db'
import { useChannelMembers } from '@hooks/useChannelMembers'
import { Badge } from '@components/ui/badge'

interface SearchFiltersProps {
    filters: SearchFiltersType
    channels: ChannelListItem[]
    dmChannels: DMChannelListItem[]
    onOpenMoreFilters: () => void
    onChannelChange?: (value: string) => void
    onUserChange?: (value: string) => void
}
export function SearchFilters({ filters, channels, dmChannels, onOpenMoreFilters, onChannelChange, onUserChange }: SearchFiltersProps) {
    const users = useLiveQuery(() => db.users.toArray(), [])
    const { members } = useChannelMembers(filters.channel_id || '')

    const userFilterOptions = members && members.length > 0 ? members : users || []
    const moreFiltersCount = [
        filters.file_type && filters.file_type.length > 0,
        filters.channel_type !== '',
        filters.is_direct_message === 1,
        filters.is_thread_message === 1,
        filters.is_pinned === 1,
        filters.saved === 1,
        filters.has_link === 1,
        filters.has_reactions === 1,
        filters.mentions_me === 1,
    ].filter(Boolean).length

    return (
        <div className="space-y-2">
            {/* Filter Controls */}
            <div className="flex flex-row items-start gap-2">
                <UserFilter
                    filters={filters}
                    users={userFilterOptions}
                    onValueChange={(value) => onUserChange?.(value)}
                    showLabel={false}
                    size="sm"
                    dropdownClassName="w-[240px]"
                />
                <ChannelSelect
                    channels={channels}
                    dmChannels={dmChannels}
                    users={users}
                    value={filters.channel_id || ""}
                    onValueChange={(value) => onChannelChange?.(value)}
                    placeholder="In"
                    allowAll
                    allLabel={_("In Any Channel")}
                    size="sm"
                    dropdownClassName="w-[270px]"
                    showLabel={false}
                    label="Channel"
                    searchable
                />
                {/* TODO: Add date range filter capability to sqlite search, either Frappe side or override in Raven */}
                {/* <DateFilter
                    className="shrink-0"
                    dropdownClassName="w-[260px]"
                    value={{ from: undefined, to: undefined }}
                    onValueChange={(range) => console.log('dateRange', range)}
                    showLabel={false}
                    size="sm"
                /> */}
                <Button variant="ghost" onClick={onOpenMoreFilters} className="text-xs font-semibold h-7 px-2 rounded-md gap-1.5">
                    <ListFilter className="w-1 h-1 mr-0.5" />
                    {_("Filters")}
                    {moreFiltersCount > 0 && <Badge className='circle size-4'>{moreFiltersCount}</Badge>}
                </Button>
                {(filters.channel_id !== '' || filters.owner !== '' || moreFiltersCount > 0) && <ClearFiltersButton />}
            </div>
            {/* Active Filter Badges */}
            <ActiveFilterBadges
                filters={filters}
                channels={channels}
                dmChannels={dmChannels}
                users={users ?? []}
            />
        </div>
    )
} 