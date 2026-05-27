import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Button } from '@components/ui/button'
import { ChevronLeft, X } from 'lucide-react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ChannelInfo from '../ChannelSettingsDrawer/ChannelInfo'
import ChannelFiles from '../ChannelSettingsDrawer/ChannelFiles'
import ChannelLinks from '../ChannelSettingsDrawer/ChannelLinks'
import ChannelThreads from '../ChannelSettingsDrawer/ChannelThreads'
import ChannelPins from '../ChannelSettingsDrawer/ChannelPins'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { UserProfileDrawer } from '@components/features/dm-channel/UserProfileDrawer'
import { useChannel } from '@hooks/useChannel'
import { useUser } from '@hooks/useUser'
import { useIsMobile } from '@hooks/use-mobile'
import _ from '@lib/translate'

const MobileChannelSettings = () => {
    const { workspaceID, id: channelID } = useParams<{ workspaceID?: string; id: string }>()
    const navigate = useNavigate()
    const isMobile = useIsMobile()
    const [searchParams, setSearchParams] = useSearchParams()
    const { channel, dmChannel } = useChannel(channelID ?? '')
    const { data: peerUser } = useUser(dmChannel?.peer_user_id ?? '')

    const isDM = !!dmChannel
    const activeTab = searchParams.get('tab') ?? 'info'

    const onTabChange = (value: string) => {
        setSearchParams({ tab: value }, { replace: true })
    }

    if (!channelID) return null
    if (!isMobile) {
        const target = isDM
            ? `/dm-channel/${encodeURIComponent(channelID)}`
            : workspaceID
                ? `/${encodeURIComponent(workspaceID)}/${encodeURIComponent(channelID)}`
                : '/'
        return <Navigate to={target} replace />
    }

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
                {isDM && peerUser && (
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                        <UserAvatar
                            user={peerUser}
                            size="sm"
                            showStatusIndicator={false}
                            showBotIndicator={false}
                        />
                        <span className="text-base font-medium text-ink-gray-8 truncate">
                            {peerUser.full_name || peerUser.name}
                        </span>
                    </div>
                )}
                {!isDM && channel && (
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

            {/* Tabs */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3">
                <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                    <TabsList variant="underline" className="grid w-full grid-cols-5 gap-1 px-1 h-8 border-0">
                        <TabsTrigger value="info">
                            {isDM ? _('Profile') : _('Info')}
                        </TabsTrigger>
                        <TabsTrigger value="files">{_('Files')}</TabsTrigger>
                        <TabsTrigger value="links">{_('Links')}</TabsTrigger>
                        <TabsTrigger value="threads">{_('Threads')}</TabsTrigger>
                        <TabsTrigger value="pins">{_('Pins')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info">
                        {isDM
                            ? peerUser && <UserProfileDrawer user={peerUser} />
                            : <ChannelInfo channelID={channelID} />}
                    </TabsContent>
                    <TabsContent value="files">
                        <ChannelFiles channelID={channelID} />
                    </TabsContent>
                    <TabsContent value="links">
                        <ChannelLinks channelID={channelID} />
                    </TabsContent>
                    <TabsContent value="threads">
                        <ChannelThreads channelID={channelID} />
                    </TabsContent>
                    <TabsContent value="pins">
                        <ChannelPins channelID={channelID} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default MobileChannelSettings
