import { useState, useRef } from 'react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { Search, UserPlus, X } from 'lucide-react'
import type { UserFields } from '@raven/types/common/UserFields'
import { ScrollArea } from '@components/ui/scroll-area'
import { db, UserData } from '../../../../db/db'
import { useLiveQuery } from 'dexie-react-hooks';
import { useDebounce } from '@raven/lib/hooks/useDebounce';
import _ from '@lib/translate'
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"

interface AddMembersStepProps {
    selectedUsers: UserData[]
    onSelectUsers: (users: UserData[]) => void
}

export const AddMembersStep = ({ selectedUsers, onSelectUsers }: AddMembersStepProps) => {

    const { myProfile } = useCurrentRavenUser()
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedText = useDebounce(searchQuery, 100)

    const filteredUsers = useLiveQuery(() => db.users
        .where('enabled')
        .equals(1)
        .and((user) => user.name !== myProfile?.name)
        .and((user) => user.name.toLowerCase().includes(debouncedText.toLowerCase()) || user.full_name.toLowerCase().includes(debouncedText.toLowerCase()))
        .and((user) => !selectedUsers.some((selected) => selected.name === user.name))
        .toArray(),
        [debouncedText, selectedUsers])

    const [announcement, setAnnouncement] = useState('')
    const searchInputRef = useRef<HTMLInputElement>(null)

    const handleSelectUser = (user: UserData) => {
        onSelectUsers([...selectedUsers, user])
        setSearchQuery('')
        setAnnouncement(_(`${user.full_name} added to channel`))
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

    const handleKeyDownOnUser = (e: React.KeyboardEvent, user: UserData) => {
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
        <div className="flex flex-col h-full min-h-0 px-6 gap-4">
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
            <div className="text-sm text-muted-foreground shrink-0" id="search-description">
                {_('Search and select team members to add to this channel. You can skip this step and invite members later.')}
            </div>

            {/* Selected Users as Badges */}
            {selectedUsers.length > 0 && (
                <div className="space-y-2 shrink-0 min-h-0 flex flex-col">
                    <div className="flex items-center justify-between shrink-0">
                        <span className="text-xs font-medium text-muted-foreground">
                            {_('Selected')} ({selectedUsers.length})
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                onSelectUsers([])
                                setAnnouncement(_('All members removed from selection'))
                            }}
                            className="h-6 text-xs px-3"
                            type="button"
                            aria-label={`Clear all ${selectedUsers.length} selected members`}
                        >
                            {_('Clear all')}
                        </Button>
                    </div>
                    <ScrollArea className="max-h-15 min-h-0 shrink-0">
                        <div className="flex flex-wrap gap-2 p-0.5" role="list" aria-label="Selected members">
                            {selectedUsers.map((user) => (
                                <button
                                    key={user.name}
                                    type="button"
                                    className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-muted transition-colors rounded-md bg-secondary text-secondary-foreground focus:shadow-md"
                                    onClick={() => handleRemoveSelectedUser(user.name)}
                                    onKeyDown={(e) => handleKeyDownOnBadge(e, user.name)}
                                    aria-label={_(`Remove ${user.full_name} from selection`)}
                                    role="listitem"
                                >
                                    <span className="text-xs">{user.full_name}</span>
                                    <X className="h-3 w-3" aria-hidden="true" />
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Search */}
            <div className="shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                        ref={searchInputRef}
                        placeholder={_('Search by name or email...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                        type="text"
                        aria-label={_('Search team members')}
                        aria-describedby="search-description"
                    />
                </div>
            </div>

            {/* Available Users */}
            <ScrollArea className="flex-1 min-h-10">
                <div className="space-y-1 p-0.5" role="list" aria-label="Available team members">
                    {filteredUsers?.map((user) => (
                        <Button
                            key={user.name}
                            type="button"
                            variant='ghost'
                            className="flex items-center gap-2.5 hover:bg-accent/50 transition-colors cursor-pointer group w-full text-left h-12"
                            onClick={() => handleSelectUser(user)}
                            onKeyDown={(e) => handleKeyDownOnUser(e, user)}
                            aria-label={_(`Add ${user.full_name} (${user.name}) to channel`)}
                            role="listitem"
                        >
                            <UserAvatar
                                user={user as UserFields}
                                size="sm"
                                className="shrink-0"
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
                            <UserPlus className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-muted-foreground shrink-0 transition-colors mr-2" aria-hidden="true" />
                        </Button>
                    ))}
                </div>

                {filteredUsers?.length === 0 && searchQuery && (
                    <div className="text-center py-8 pr-4">
                        <p className="text-sm text-muted-foreground">
                            {_('No users found matching your search.')}
                        </p>
                    </div>
                )}

                {filteredUsers?.length === 0 && !searchQuery && selectedUsers.length > 0 && (
                    <div className="text-center py-8 pr-4">
                        <p className="text-sm text-muted-foreground">
                            {_('All available users have been selected.')}
                        </p>
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}

