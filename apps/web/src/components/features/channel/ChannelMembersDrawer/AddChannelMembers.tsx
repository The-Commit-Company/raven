import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { UserAvatar } from '@components/features/message/UserAvatar';
import { Search, UserPlus, X } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import type { UserFields } from '@raven/types/common/UserFields';
import { useDebounce } from '@raven/lib/hooks/useDebounce';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type UserData } from '../../../../db/db';
import _ from '@lib/translate';
import { ScrollArea } from '@components/ui/scroll-area';
import { Virtuoso } from 'react-virtuoso';
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk';
import { toast } from 'sonner';
import ErrorBanner from '@components/ui/error-banner';

const AddChannelMembers = ({ memberIds, channelID, onClose }: { memberIds: string[], channelID: string, onClose: () => void }) => {

    const { call, error, loading } = useFrappePostCall('raven.api.raven_channel_member.add_channel_members')
    const { mutate } = useSWRConfig()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUsers, setSelectedUsers] = useState<UserData[]>([])

    const debouncedText = useDebounce(searchQuery, 200)
    const filterText = searchQuery === '' ? '' : debouncedText

    const filteredUsers = useLiveQuery(() => db.users
        .where('enabled')
        .equals(1)
        .and((user) => user.name.toLowerCase().includes(filterText.toLowerCase()) || user.full_name.toLowerCase().includes(filterText.toLowerCase()))
        .and((user) => !memberIds.includes(user.name))
        .and((user) => !selectedUsers.some((selected) => selected.name === user.name))
        .toArray(),
        [filterText, memberIds, selectedUsers]) || []

    const handleSelectUser = (user: UserData) => {
        setSelectedUsers(prev => [...prev, user])
        setSearchQuery('')
    }

    const handleRemoveSelectedUser = (userName: string) => {
        setSelectedUsers(prev => prev.filter(user => user.name !== userName))
    }

    const handleAddMembers = () => {
        if (selectedUsers.length > 0) {
            call({
                channel_id: channelID,
                members: selectedUsers.map(u => u.name)
            })
                .then(() => {
                    toast.success("Members added")
                    mutate(["channel_members", channelID])
                    onClose()
                })
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 px-1 space-y-3 flex flex-col min-h-0">
                {/* Description */}
                <div className="text-xs text-muted-foreground py-1 pt-2">
                    {_('Search and add members to this channel')}
                </div>
                {error && <ErrorBanner error={error} />}
                {/* Selected Users as Badges */}
                {selectedUsers.length > 0 && (
                    <div className="space-y-2 shrink-0 min-h-0 flex flex-col">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                {_(`Selected (${selectedUsers.length})`)}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedUsers([])}
                                className="h-6 text-xs"
                            >
                                {_('Clear all')}
                            </Button>
                        </div>
                        <ScrollArea className="max-h-15 min-h-0 shrink-0">
                            <div className="flex flex-wrap gap-2" role="list" aria-label="Selected members">
                                {selectedUsers.map((user) => (
                                    <Badge
                                        key={user.name}
                                        variant="secondary"
                                        className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-muted transition-colors"
                                        onClick={() => handleRemoveSelectedUser(user.name)}
                                    >
                                        <span className="text-xs">{user.full_name}</span>
                                        <X className="h-3 w-3" />
                                    </Badge>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {/* Search */}
                <div className="space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-8 text-sm"
                        />
                    </div>
                </div>

                {/* Available Users */}
                <div className="flex-1 min-h-0">
                    {filteredUsers.length > 0 ? (
                        <Virtuoso
                            style={{ height: '100%', width: '100%' }}
                            data={filteredUsers}
                            overscan={200}
                            itemContent={(index, user) => (
                                <div
                                    key={user.name}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer mb-1"
                                    onClick={() => handleSelectUser(user)}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <UserAvatar
                                            user={user as UserFields}
                                            size="md"
                                            className="shrink-0"
                                            showStatusIndicator={false}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium truncate">
                                                    {user.full_name}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {user.name}
                                            </div>
                                        </div>
                                    </div>
                                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                                </div>
                            )}
                        />
                    ) : searchQuery ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                                {_('No users found matching your search.')}
                            </p>
                        </div>
                    ) : null}
                </div>

            </div>

            {/* Sticky Add Button at Bottom */}
            {selectedUsers.length > 0 && (
                <div className="border-t bg-background">
                    <Button
                        onClick={handleAddMembers}
                        className="w-full cursor-pointer"
                        size="sm"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {_(`Add ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`)}
                    </Button>
                </div>
            )}
        </div>
    )
}

export default AddChannelMembers