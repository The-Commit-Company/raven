import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { FilterComponentProps } from './types'
import { updateFilter } from './utils'
import { Label } from '@components/ui/label'
import { cn } from "../../../lib/utils"

interface UserFilterProps extends FilterComponentProps {
    size?: 'sm'
}

export function UserFilter({ filters, onFiltersChange, availableUsers, showLabel = true, size }: UserFilterProps) {

    if (!availableUsers || availableUsers.length === 0) {
        return null
    }

    const selectedUser = availableUsers.find(u => u.name === filters.selectedUser)

    // Determine classes based on size
    const triggerSizeClass = size === 'sm' ? '!h-7 !py-1 text-xs [&>span]:!px-0' : '!h-9 !py-2 [&>span]:!px-0'
    const labelSizeClass = size === 'sm' ? 'text-xs' : ''

    // Dynamic padding based on whether we have a selected user with avatar
    const hasSelectedAvatar = selectedUser && filters.selectedUser !== 'all'
    const paddingClass = hasSelectedAvatar ? (size === 'sm' ? '!px-2' : '!px-3') : (size === 'sm' ? '!px-3' : '!px-4')

    return (
        <div className="flex-shrink-0">
            {showLabel && <Label className="text-xs text-muted-foreground mb-1 block">From</Label>}
            <Select
                value={filters.selectedUser}
                onValueChange={(value) => updateFilter(filters, 'selectedUser', value, onFiltersChange)}>
                <SelectTrigger className={cn("w-fit [&>span]:text-inherit", triggerSizeClass, paddingClass)}>
                    {selectedUser && filters.selectedUser !== 'all' ? (
                        <div className="flex items-center gap-1">
                            <UserAvatar
                                user={selectedUser}
                                size="sm"
                                showStatusIndicator={false}
                                showBotIndicator={false}
                            />
                            <span className={cn("pl-0.5", labelSizeClass)}>{selectedUser.full_name}</span>
                        </div>
                    ) : (
                        <SelectValue placeholder="From" className={cn("pl-1", labelSizeClass)} />
                    )}
                </SelectTrigger>
                <SelectContent className="w-full">
                    <SelectItem value="all">From Anyone</SelectItem>
                    {availableUsers.map((user) => (
                        <SelectItem key={user.name} value={user.name}>
                            <div className="flex items-center gap-1">
                                <UserAvatar
                                    user={user}
                                    size="sm"
                                    showStatusIndicator={false}
                                    showBotIndicator={false}
                                />
                                <span className="pl-0.5">{user.full_name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}