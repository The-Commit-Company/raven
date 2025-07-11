import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { FilterComponentProps } from './types'
import { updateFilter } from './utils'
import { Label } from '@components/ui/label'

export function UserFilter({ filters, onFiltersChange, availableUsers, showLabel = true }: FilterComponentProps) {

    if (!availableUsers || availableUsers.length === 0) {
        return null
    }

    const selectedUser = availableUsers.find(u => u.name === filters.selectedUser)

    return (
        <div className="flex-shrink-0">
            {showLabel && <Label className="text-xs text-muted-foreground mb-1 block">From</Label>}
            <Select
                value={filters.selectedUser}
                onValueChange={(value) => updateFilter(filters, 'selectedUser', value, onFiltersChange)}>
                <SelectTrigger className="w-fit">
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
                <SelectContent className="w-full">
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
        </div>
    )
} 