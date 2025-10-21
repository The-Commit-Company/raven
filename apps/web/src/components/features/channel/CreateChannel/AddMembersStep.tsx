import { useState, useRef } from 'react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { Search, UserPlus, X } from 'lucide-react'
import type { RavenUser } from '@raven/types/Raven/RavenUser'
import type { UserFields } from '@raven/types/common/UserFields'
import { ScrollArea } from '@components/ui/scroll-area'

interface AddMembersStepProps {
    selectedUsers: RavenUser[]
    onSelectUsers: (users: RavenUser[]) => void
}

export const AddMembersStep = ({ selectedUsers, onSelectUsers }: AddMembersStepProps) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [announcement, setAnnouncement] = useState('')
    const searchInputRef = useRef<HTMLInputElement>(null)

    // TODO: Replace with actual data from API
    const mockAvailableUsers: RavenUser[] = [
        {
            name: 'michael.brown@company.com',
            full_name: 'Michael Brown',
            user_image:
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            type: 'User',
            availability_status: 'Available',
            custom_status: '',
            enabled: 1,
            first_name: 'Michael',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0,
        },
        {
            name: 'emily.davis@company.com',
            full_name: 'Emily Davis',
            user_image:
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            type: 'User',
            availability_status: 'Away',
            custom_status: 'On lunch break',
            enabled: 1,
            first_name: 'Emily',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0,
        },
        {
            name: 'daniel.wilson@company.com',
            full_name: 'Daniel Wilson',
            user_image:
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            type: 'User',
            availability_status: 'Available',
            custom_status: '',
            enabled: 1,
            first_name: 'Daniel',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0,
        },
        {
            name: 'olivia.moore@company.com',
            full_name: 'Olivia Moore',
            user_image:
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            type: 'User',
            availability_status: 'Do not disturb',
            custom_status: 'In a call',
            enabled: 1,
            first_name: 'Olivia',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0,
        },
        {
            name: 'david.lee@company.com',
            full_name: 'David Lee',
            user_image: undefined,
            type: 'User',
            availability_status: 'Available',
            custom_status: '',
            enabled: 1,
            first_name: 'David',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0,
        },
    ]

    const filteredUsers = mockAvailableUsers.filter(
        (user) =>
            !selectedUsers.some((selected) => selected.name === user.name) &&
            (user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const handleSelectUser = (user: RavenUser) => {
        onSelectUsers([...selectedUsers, user])
        setSearchQuery('')
        setAnnouncement(`${user.full_name} added to channel`)
        // Return focus to search input after selection
        setTimeout(() => {
            searchInputRef.current?.focus()
        }, 0)
    }

    const handleRemoveSelectedUser = (userName: string) => {
        const removedUser = selectedUsers.find((user) => user.name === userName)
        onSelectUsers(selectedUsers.filter((user) => user.name !== userName))
        if (removedUser) {
            setAnnouncement(`${removedUser.full_name} removed from channel`)
        }
    }

    const handleKeyDownOnUser = (e: React.KeyboardEvent, user: RavenUser) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleSelectUser(user)
        }
    }

    const handleKeyDownOnBadge = (e: React.KeyboardEvent, userName: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleRemoveSelectedUser(userName)
        }
    }

    return (
        <div className="space-y-5 h-full overflow-y-auto px-6">
            {/* Screen reader announcements */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {announcement}
            </div>

            {/* Description */}
            <div className="text-sm text-muted-foreground" id="search-description">
                Search and select team members to add to this channel. You can skip this step and invite members later.
            </div>

            {/* Selected Users as Badges */}
            {selectedUsers.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                            Selected ({selectedUsers.length})
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                onSelectUsers([])
                                setAnnouncement('All members removed from selection')
                            }}
                            className="h-6 text-xs px-3"
                            type="button"
                            aria-label={`Clear all ${selectedUsers.length} selected members`}
                        >
                            Clear all
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2" role="list" aria-label="Selected members">
                        {selectedUsers.map((user) => (
                            <button
                                key={user.name}
                                type="button"
                                className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-muted transition-colors rounded-md bg-secondary text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onClick={() => handleRemoveSelectedUser(user.name)}
                                onKeyDown={(e) => handleKeyDownOnBadge(e, user.name)}
                                aria-label={`Remove ${user.full_name} from selection`}
                                role="listitem"
                            >
                                <span className="text-xs">{user.full_name}</span>
                                <X className="h-3 w-3" aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                        ref={searchInputRef}
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                        type="text"
                        aria-label="Search team members"
                        aria-describedby="search-description"
                    />
                </div>
            </div>

            {/* Available Users */}
            <ScrollArea className="h-[320px]">
                <div className="space-y-0.5 pr-4" role="list" aria-label="Available team members">
                    {filteredUsers.map((user) => (
                        <button
                            key={user.name}
                            type="button"
                            className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer group w-full text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                            onClick={() => handleSelectUser(user)}
                            onKeyDown={(e) => handleKeyDownOnUser(e, user)}
                            aria-label={`Add ${user.full_name} (${user.name}) to channel`}
                            role="listitem"
                        >
                            <UserAvatar
                                user={user as UserFields}
                                size="sm"
                                className="flex-shrink-0"
                                showStatusIndicator={false}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate leading-tight">
                                    {user.full_name}
                                </div>
                                <div className="text-xs text-muted-foreground truncate leading-tight">
                                    {user.name}
                                </div>
                            </div>
                            <UserPlus className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-muted-foreground flex-shrink-0 transition-colors" aria-hidden="true" />
                        </button>
                    ))}
                </div>

                {filteredUsers.length === 0 && searchQuery && (
                    <div className="text-center py-8 pr-4">
                        <p className="text-sm text-muted-foreground">
                            No users found matching your search.
                        </p>
                    </div>
                )}

                {filteredUsers.length === 0 && !searchQuery && selectedUsers.length > 0 && (
                    <div className="text-center py-8 pr-4">
                        <p className="text-sm text-muted-foreground">
                            All available users have been selected.
                        </p>
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}

