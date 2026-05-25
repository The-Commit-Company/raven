import { useMemo, useState } from 'react'
import { Button } from '@components/ui/button'
import { ChevronLeft, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import ChannelMembersList from '../ChannelMembersDrawer/ChannelMembersList'
import AddChannelMembers from '../ChannelMembersDrawer/AddChannelMembers'
import { useChannelMembers } from '@hooks/useChannelMembers'
import { useChannel } from '@hooks/useChannel'
import { hasRole } from '@lib/permissions'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import _ from '@lib/translate'

const ChannelMembers = () => {
    const { id: channelID } = useParams<{ workspaceID: string; id: string }>()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('members')

    const { channel } = useChannel(channelID ?? '')
    const { members, memberIds } = useChannelMembers(channelID ?? '')

    const allowSettingChange = useMemo(() => {
        if (channel?.is_admin == 1) return true
        if (channel?.member_id && hasRole("Raven Admin")) return true
        return false
    }, [channel])

    if (!channelID) return null

    const showTabs = channel?.type !== 'Open' && allowSettingChange

    return (
        <div className="flex flex-col h-full w-full bg-surface-white">
            {/* Header */}
            <div className="flex items-center gap-1 px-2 py-1.5 border-b bg-surface-white shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    isIconButton
                    onClick={() => navigate(-1)}
                    aria-label={_('Back')}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                {channel && (
                    <div className="flex flex-1 items-center gap-1.5 min-w-0">
                        <ChannelIcon type={channel.type} className="h-4 w-4 shrink-0" />
                        <span className="text-base font-medium text-ink-gray-8 truncate">
                            {channel.channel_name}
                        </span>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    isIconButton
                    onClick={() => navigate(-1)}
                    aria-label={_('Close')}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 p-3 flex flex-col">
                {showTabs ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 min-h-0">
                        <TabsList variant="underline" className="grid w-full grid-cols-2 gap-1 px-1 h-8 border-0">
                            <TabsTrigger value="members">{_('Members')}</TabsTrigger>
                            <TabsTrigger value="add">{_('Add Members')}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="members" className="flex flex-col min-h-0 m-0">
                            <ChannelMembersList members={members} channelID={channelID} allowSettingChange={allowSettingChange} />
                        </TabsContent>
                        <TabsContent value="add" className="flex flex-col min-h-0 m-0">
                            <AddChannelMembers memberIds={memberIds} channelID={channelID} onClose={() => navigate(-1)} />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <ChannelMembersList members={members} channelID={channelID} allowSettingChange={false} />
                )}
            </div>
        </div>
    )
}

export default ChannelMembers
