import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { FilterComponentProps } from './types'
import { updateFilter } from './utils'

export function UserFilter({ filters, onFiltersChange, availableUsers }: FilterComponentProps) {

    if (!availableUsers || availableUsers.length === 0) {
        return null
    }

    const selectedUser = availableUsers.find(u => u.name === filters.selectedUser)
    const triggerClassName = selectedUser && filters.selectedUser !== 'all' ? 'w-fit pl-1 pr-3' : 'w-fit'

    return (
        <Select
            value={filters.selectedUser}
            onValueChange={(value) => updateFilter(filters, 'selectedUser', value, onFiltersChange)}>
            <SelectTrigger className={triggerClassName}>
                {selectedUser && filters.selectedUser !== 'all' ? (
                    <div className="flex items-center gap-2">
                        <UserAvatar
                            user={selectedUser}
                            size="sm"
                            showStatusIndicator={false}
                            showBotIndicator={false}
                        />
                        <span>{selectedUser.full_name}</span>
                    </div>
                ) : (
                    <SelectValue placeholder="From" />
                )}
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">From Anyone</SelectItem>
                {availableUsers.map((user) => (
                    <SelectItem key={user.name} value={user.name}>
                        <div className="flex items-center gap-2">
                            <UserAvatar
                                user={user}
                                size="sm"
                                showStatusIndicator={false}
                                showBotIndicator={false}
                            />
                            <span>{user.full_name}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
} 