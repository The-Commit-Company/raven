import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { ScrollArea } from '@components/ui/scroll-area'
import { Button } from '@components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ChannelInfo from '../ChannelSettingsDrawer/ChannelInfo'
import ChannelFiles from '../ChannelSettingsDrawer/ChannelFiles'
import ChannelLinks from '../ChannelSettingsDrawer/ChannelLinks'
import ChannelThreads from '../ChannelSettingsDrawer/ChannelThreads'
import ChannelPins from '../ChannelSettingsDrawer/ChannelPins'
import _ from '@lib/translate'

const ChannelSettings = () => {
    const { id: channelID } = useParams<{ workspaceID: string; id: string }>()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const activeTab = searchParams.get('tab') ?? 'info'

    const onTabChange = (value: string) => {
        setSearchParams({ tab: value }, { replace: true })
    }

    if (!channelID) return null

    return (
        <div className="flex flex-col h-full bg-surface-white">
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
                <span className="text-base font-medium text-ink-gray-8">{_('Channel Settings')}</span>
            </div>

            {/* Tabs */}
            <div className="flex-1 overflow-hidden p-3">
                <ScrollArea className="h-full">
                    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                        <TabsList variant="underline" className="grid w-full grid-cols-5 gap-1 px-1 h-8 border-0">
                            <TabsTrigger value="info">{_('Info')}</TabsTrigger>
                            <TabsTrigger value="files">{_('Files')}</TabsTrigger>
                            <TabsTrigger value="links">{_('Links')}</TabsTrigger>
                            <TabsTrigger value="threads">{_('Threads')}</TabsTrigger>
                            <TabsTrigger value="pins">{_('Pins')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info">
                            <ChannelInfo channelID={channelID} />
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
                </ScrollArea>
            </div>
        </div>
    )
}

export default ChannelSettings
