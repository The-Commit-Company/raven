import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { UserAvatar } from '@components/features/message/UserAvatar';
import { Search, MoreVertical, Crown, UserMinus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip';

import type { RavenUser } from '@raven/types/Raven/RavenUser';
import type { UserFields } from '@raven/types/common/UserFields';

const ChannelMembersList = () => {

    const [searchQuery, setSearchQuery] = useState('')

    const mockMembers: (RavenUser & { is_admin?: boolean; last_visit?: string })[] = [
        {
            name: 'alex.johnson@company.com',
            full_name: 'Alex Johnson',
            user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            type: 'User',
            availability_status: 'Available',
            custom_status: '',
            enabled: 1,
            first_name: 'Alex',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0,
            is_admin: true,
            last_visit: '2024-01-15T10:30:00Z'
        },
        {
            name: 'sam.smith@company.com',
            full_name: 'Sam Smith',
            user_image: undefined,
            type: 'User',
            availability_status: 'Away',
            custom_status: 'In a meeting',
            enabled: 1,
            first_name: 'Sam',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0,
            is_admin: false,
            last_visit: '2024-01-15T09:15:00Z'
        },
        {
            name: 'taylor.reed@company.com',
            full_name: 'Taylor Reed',
            user_image: undefined,
            type: 'User',
            availability_status: 'Do not disturb',
            custom_status: 'Focus mode',
            enabled: 1,
            first_name: 'Taylor',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0,
            is_admin: false,
            last_visit: '2024-01-15T08:45:00Z'
        },
        {
            name: 'john.doe@company.com',
            full_name: 'John Doe',
            user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            type: 'User',
            availability_status: 'Available',
            custom_status: '',
            enabled: 1,
            first_name: 'John',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0,
            is_admin: false,
            last_visit: '2024-01-15T11:20:00Z'
        },
        {
            name: 'jane.smith@company.com',
            full_name: 'Jane Smith',
            user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c3?w=150&h=150&fit=crop&crop=face',
            type: 'User',
            availability_status: 'Available',
            custom_status: 'Working on new features',
            enabled: 1,
            first_name: 'Jane',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0,
            is_admin: true,
            last_visit: '2024-01-15T10:45:00Z'
        },
        {
            name: 'desirae.lipshutz@company.com',
            full_name: 'Desirae Lipshutz',
            user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            type: 'User',
            availability_status: 'Available',
            custom_status: '',
            enabled: 1,
            first_name: 'Desirae',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0,
            is_admin: false,
            last_visit: '2024-01-15T09:30:00Z'
        },
        {
            name: 'brandon.franci@company.com',
            full_name: 'Brandon Franci',
            user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            type: 'User',
            availability_status: 'Available',
            custom_status: '',
            enabled: 1,
            first_name: 'Brandon',
            creation: '2024-01-01',
            modified: '2024-01-01',
            owner: 'admin',
            modified_by: 'admin',
            docstatus: 0,
            is_admin: false,
            last_visit: '2024-01-15T11:00:00Z'
        }
    ]

    const filteredMembers = mockMembers.filter(member =>
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleRemoveMember = (memberName: string) => {
        console.log('Remove member:', memberName);
    }

    const handleToggleAdmin = (memberName: string, isAdmin: boolean) => {
        console.log(`${isAdmin ? 'Remove' : 'Make'} admin:`, memberName);
    }

    return (
        <div className="px-1 space-y-3">
            {/* Member count */}
            <div className="text-xs text-muted-foreground">
                {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm"
                />
            </div>

            {/* Members List */}
            <div className="space-y-1">
                {filteredMembers.map((member) => (
                    <div
                        key={member.name}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <UserAvatar
                                user={member as UserFields}
                                size="md"
                                className="flex-shrink-0"
                                showStatusIndicator={false}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium truncate">
                                        {member.full_name}
                                    </span>
                                    {member.is_admin && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Channel Admin</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {member.name}
                                </div>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {member.is_admin ? (
                                    <DropdownMenuItem
                                        onClick={() => handleToggleAdmin(member.name, true)}
                                    >
                                        <Crown className="h-4 w-4 mr-2" />
                                        Remove admin
                                    </DropdownMenuItem>
                                ) : (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => handleToggleAdmin(member.name, false)}
                                        >
                                            <Crown className="h-4 w-4 mr-2" />
                                            Make admin
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleRemoveMember(member.name)}
                                        >
                                            <UserMinus className="h-4 w-4 mr-2" />
                                            Remove from channel
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </div>

            {filteredMembers.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                        {searchQuery ? 'No members found matching your search.' : 'No members in this channel.'}
                    </p>
                </div>
            )}
        </div>
    )
}

export default ChannelMembersList