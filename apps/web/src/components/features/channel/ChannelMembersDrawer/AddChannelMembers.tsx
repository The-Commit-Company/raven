import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { UserAvatar } from '@components/features/message/UserAvatar';
import { Search, UserPlus, X } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { useDebounce } from '@raven/lib/hooks/useDebounce';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, UserData } from "@db";
import _ from '@lib/translate';
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
                    toast.success(_("Members added"))
                    mutate(["channel_members", channelID])
                    onClose()
                })
        }
    }

    return (
        <div className="flex flex-col h-full min-h-0 gap-2">
            {/* Description */}
            <div className="text-xs text-ink-gray-4 px-1 shrink-0">
                {_('Search and add members to this channel')}
            </div>

            {error && (
                <div className="px-1 shrink-0">
                    <ErrorBanner error={error} />
                </div>
            )}

            {/* Selected Users as Badges */}
            {selectedUsers.length > 0 && (
                <div className="px-1 shrink-0 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-ink-gray-4">
                            {_("Selected ({0})", [selectedUsers.length.toString()])}
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
                    <div className="flex flex-wrap gap-2 max-h-15 overflow-y-auto" role="list" aria-label={_("Selected members")}>
                        {selectedUsers.map((user) => (
                            <Badge
                                key={user.name}
                                variant="subtle"
                                className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-surface-gray-2 transition-colors"
                                onClick={() => handleRemoveSelectedUser(user.name)}
                            >
                                <span className="text-xs">{user.full_name}</span>
                                <X className="h-3 w-3" />
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative px-1 shrink-0">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink-gray-4" />
                <Input
                    placeholder={_("Search users...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm"
                />
            </div>

            {/* Available Users */}
            {filteredUsers.length > 0 ? (
                <div className="flex-1 min-h-0 px-1">
                    <Virtuoso
                        style={{ height: '100%', width: '100%' }}
                        data={filteredUsers}
                        overscan={200}
                        itemContent={(_index, user) => (
                            <div
                                key={user.name}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-gray-2/50 transition-colors cursor-pointer mb-1"
                                onClick={() => handleSelectUser(user)}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <UserAvatar
                                        user={user}
                                        size="md"
                                        className="shrink-0"
                                        showStatusIndicator={false}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium truncate block">
                                            {user.full_name}
                                        </span>
                                        <div className="text-xs text-ink-gray-4">
                                            {user.name}
                                        </div>
                                    </div>
                                </div>
                                <UserPlus className="h-4 w-4 text-ink-gray-4 shrink-0" />
                            </div>
                        )}
                    />
                </div>
            ) : searchQuery ? (
                <div className="text-center py-8 shrink-0">
                    <p className="text-sm text-ink-gray-4">
                        {_('No users found matching your search.')}
                    </p>
                </div>
            ) : null}

            {/* Add Button */}
            {selectedUsers.length > 0 && (
                <div className="shrink-0 p-2 bg-surface-white">
                    <Button
                        onClick={handleAddMembers}
                        disabled={loading}
                        className="w-full cursor-pointer"
                        size="md"
                    >
                        <UserPlus className="h-4 w-4" />
                        {_("Add {0} members", [selectedUsers.length.toString()])}
                    </Button>
                </div>
            )}
        </div>
    )
}

export default AddChannelMembers
