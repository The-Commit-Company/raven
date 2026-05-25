import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { UserAvatar } from '@components/features/message/UserAvatar';
import { Search, MoreVertical, Crown, UserMinus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip';
import _ from '@lib/translate';
import { ChannelMemberData } from '@hooks/useChannelMembers';
import { Virtuoso } from 'react-virtuoso';
import { useFrappeDeleteDoc, useFrappeUpdateDoc, useSWRConfig } from 'frappe-react-sdk';
import { toast } from 'sonner';

const ChannelMembersList = ({ members, channelID, allowSettingChange }: { members: ChannelMemberData[], channelID: string, allowSettingChange: boolean }) => {

    const [searchQuery, setSearchQuery] = useState('')

    const filteredMembers = members.filter(member =>
        member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col h-full min-h-0 gap-2">
            {/* Member count */}
            <div className="text-xs text-ink-gray-4 px-1 shrink-0">
                {_("{0} members", [filteredMembers.length.toString()])}
            </div>

            {/* Search */}
            <div className="relative px-1 shrink-0">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink-gray-4" />
                <Input
                    placeholder={_("Search members...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm"
                />
            </div>

            {/* Members List */}
            {filteredMembers.length === 0 ? (
                <div className="text-center py-8 shrink-0">
                    <p className="text-sm text-ink-gray-4">
                        {searchQuery ? _("No members found matching your search.") : _("No members in this channel.")}
                    </p>
                </div>
            ) : (
                <div className="flex-1 min-h-0 px-1">
                    <MembersList filteredMembers={filteredMembers} channelID={channelID} allowSettingChange={allowSettingChange} />
                </div>
            )}
        </div>
    )
}

const MembersList = ({ filteredMembers, channelID, allowSettingChange }: { filteredMembers: ChannelMemberData[], channelID: string, allowSettingChange: boolean }) => {
    const { mutate } = useSWRConfig()
    const { deleteDoc } = useFrappeDeleteDoc()
    const { updateDoc } = useFrappeUpdateDoc()

    const handleRemoveMember = (member: ChannelMemberData) => {
        if (!member.channel_member_name) return
        deleteDoc('Raven Channel Member', member.channel_member_name)
            .then(() => {
                toast.success(_("Member removed"))
                mutate(["channel_members", channelID])
            })
            .catch(() => toast.error(_("Failed to remove member")))
    }

    const handleToggleAdmin = (member: ChannelMemberData) => {
        if (!member.channel_member_name) return
        const newAdminStatus = member.is_admin === 1 ? 0 : 1
        updateDoc('Raven Channel Member', member.channel_member_name, { is_admin: newAdminStatus })
            .then(() => {
                toast.success(newAdminStatus === 1 ? _("Member is now an admin") : _("Admin rights removed"))
                mutate(["channel_members", channelID])
            })
            .catch(() => toast.error(_("Failed to update member")))
    }

    return (
        <Virtuoso
            style={{ height: '100%', width: '100%' }}
            data={filteredMembers}
            overscan={200}
            itemContent={(_index, member) => (
                <div
                    key={member.name}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-gray-2/50 transition-colors group mb-1"
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
                                            <Crown className="h-3 w-3 text-ink-amber-4 shrink-0" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{_('Channel Admin')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                            <div className="text-xs text-ink-gray-4">
                                {member.name}
                            </div>
                        </div>
                    </div>

                    {allowSettingChange && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    isIconButton
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleToggleAdmin(member)}>
                                    <Crown className="h-4 w-4 mr-2" />
                                    {member.is_admin === 1 ? _('Remove admin') : _('Make admin')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => handleRemoveMember(member)}
                                >
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    {_('Remove from channel')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            )}
        />
    )
}

export default ChannelMembersList
