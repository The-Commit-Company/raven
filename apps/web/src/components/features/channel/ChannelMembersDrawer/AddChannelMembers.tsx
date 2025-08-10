import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { UserAvatar } from '@components/features/message/UserAvatar';
import { Search, UserPlus, X } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import type { RavenUser } from '@raven/types/Raven/RavenUser';
import type { UserFields } from '@raven/types/common/UserFields';

const AddChannelMembers = () => {

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUsers, setSelectedUsers] = useState<RavenUser[]>([])

    const mockAvailableUsers: RavenUser[] = [
        {
            name: 'michael.brown@company.com',
            full_name: 'Michael Brown',
            user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            type: 'User',
            availability_status: 'Available',
            custom_status: '',
            enabled: 1,
            first_name: 'Michael',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0
        },
        {
            name: 'emily.davis@company.com',
            full_name: 'Emily Davis',
            user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            type: 'User',
            availability_status: 'Away',
            custom_status: 'On lunch break',
            enabled: 1,
            first_name: 'Emily',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0
        },
        {
            name: 'daniel.wilson@company.com',
            full_name: 'Daniel Wilson',
            user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            type: 'User',
            availability_status: 'Available',
            custom_status: '',
            enabled: 1,
            first_name: 'Daniel',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0
        },
        {
            name: 'olivia.moore@company.com',
            full_name: 'Olivia Moore',
            user_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            type: 'User',
            availability_status: 'Do not disturb',
            custom_status: 'In a call',
            enabled: 1,
            first_name: 'Olivia',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0
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
            docstatus: 0
        }
    ]

    const filteredUsers = mockAvailableUsers.filter(user =>
        !selectedUsers.some(selected => selected.name === user.name) &&
        (user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const handleSelectUser = (user: RavenUser) => {
        setSelectedUsers(prev => [...prev, user])
        setSearchQuery('')
    }

    const handleRemoveSelectedUser = (userName: string) => {
        setSelectedUsers(prev => prev.filter(user => user.name !== userName))
    }

    const handleAddMembers = () => {
        console.log('Adding members with IDs:', selectedUsers.map(u => u.name))
        setSelectedUsers([])
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 px-1 space-y-4">
                {/* Description */}
                <div className="text-xs text-muted-foreground">
                    Search and add members to this channel
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
                                onClick={() => setSelectedUsers([])}
                                className="h-6 text-xs"
                            >
                                Clear all
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                <div className="space-y-1">
                    {filteredUsers.map((user) => (
                        <div
                            key={user.name}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => handleSelectUser(user)}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <UserAvatar
                                    user={user as UserFields}
                                    size="md"
                                    className="flex-shrink-0"
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
                    ))}
                </div>

                {filteredUsers.length === 0 && searchQuery && (
                    <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                            No users found matching your search.
                        </p>
                    </div>
                )}

            </div>

            {/* Sticky Add Button at Bottom */}
            {selectedUsers.length > 0 && (
                <div className="border-t bg-background p-3">
                    <Button
                        onClick={handleAddMembers}
                        className="w-full"
                        size="sm"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
                    </Button>
                </div>
            )}
        </div>
    )
}

export default AddChannelMembers