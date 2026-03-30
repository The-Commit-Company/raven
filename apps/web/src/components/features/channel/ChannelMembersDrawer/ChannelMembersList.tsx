import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { UserAvatar } from '@components/features/message/UserAvatar';
import { Search, MoreVertical, Crown, UserMinus, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip';
import _ from '@lib/translate';
import { ChannelMemberData } from '@hooks/useChannelMembers';
import { Virtuoso } from 'react-virtuoso';

const ChannelMembersList = ({ members, allowSettingChange, showCloseButton, onClose }: { members: ChannelMemberData[], allowSettingChange: boolean, showCloseButton: boolean, onClose: () => void }) => {

    const [searchQuery, setSearchQuery] = useState('')

    const filteredMembers = members.filter(member =>
        member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-2 h-full flex flex-col">
            {/* Member count */}
            <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground p-2 shrink-0">
                    {_(`${filteredMembers.length} member${filteredMembers.length !== 1 ? 's' : ''}`)}
                </div>
                {showCloseButton && <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 ml-2 shrink-0"
                    onClick={onClose}
                    aria-label="Close drawer"
                >
                    <X className="h-3 w-3" />
                </Button>}
            </div>

            {/* Search */}
            <div className="relative px-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm"
                />
            </div>

            {/* Members List */}
            <div className="flex-1 min-h-0 h-[calc(100vh-16rem)] px-1">
                <MembersList filteredMembers={filteredMembers} allowSettingChange={allowSettingChange} />
            </div>

            {filteredMembers.length === 0 && (
                <div className="text-center py-8 shrink-0">
                    <p className="text-sm text-muted-foreground">
                        {searchQuery ? 'No members found matching your search.' : 'No members in this channel.'}
                    </p>
                </div>
            )}
        </div>
    )
}

const MembersList = ({ filteredMembers, allowSettingChange }: { filteredMembers: ChannelMemberData[], allowSettingChange: boolean }) => {
    const handleRemoveMember = (memberName: string) => {
        console.log('Remove member:', memberName);
    }

    const handleToggleAdmin = (memberName: string, isAdmin: boolean) => {
        console.log(`${isAdmin ? 'Remove' : 'Make'} admin:`, memberName);
    }

    if (filteredMembers.length === 0) return null;

    return (
        <Virtuoso
            style={{ height: '100%', width: '100%' }}
            data={filteredMembers}
            overscan={200}
            itemContent={(index, member) => (
                <div
                    key={member.name}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group mb-1"
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <UserAvatar
                            user={member}
                            size="md"
                            className="shrink-0"
                            showStatusIndicator={false}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                    {member.full_name}
                                </span>
                                {member.is_admin === 1 && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Crown className="h-3 w-3 text-yellow-500 shrink-0" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{_('Channel Admin')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {member.name}
                            </div>
                        </div>
                    </div>

                    {allowSettingChange && <DropdownMenu>
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
                                    {_('Remove admin')}
                                </DropdownMenuItem>
                            ) : (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => handleToggleAdmin(member.name, false)}
                                    >
                                        <Crown className="h-4 w-4 mr-2" />
                                        {_('Make admin')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => handleRemoveMember(member.name)}
                                    >
                                        <UserMinus className="h-4 w-4 mr-2" />
                                        {_('Remove from channel')}
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>}
                </div>
            )}
        />
    )
}

export default ChannelMembersList