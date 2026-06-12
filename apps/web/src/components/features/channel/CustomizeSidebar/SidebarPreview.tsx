import { ChevronRight } from 'lucide-react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@components/ui/collapsible'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import { ChannelGroupLabel } from '@components/channel-sidebar/ChannelSidebar'
import { ChannelSidebarData } from '@raven/lib/hooks/useGroupedChannels'
import { useEffect, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'

interface SidebarPreviewProps {
    data: ChannelSidebarData
}

/** Non-interactive mirror of ChannelSidebar's layout for the customize dialog. */
export const SidebarPreview = ({ data }: SidebarPreviewProps) => {

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
    const [scrollerRef, setScrollerRef] = useState<HTMLElement | null>(null)

    useEffect(() => {
        data.groupedChannels.forEach(([groupName, channels]) => {
            if (channels.length > 0 && openGroups[groupName] === false) {
                setOpenGroups(prev => ({ ...prev, [groupName]: true }))
            }
            else if (channels.length === 0 && openGroups[groupName] === true) {
                setOpenGroups(prev => ({ ...prev, [groupName]: false }))
            }
        })
    }, [data.groupedChannels])

    const isGroupOpen = (groupName: string, hasChannels: boolean) => {
        if (groupName in openGroups) {
            return openGroups[groupName]
        }
        return hasChannels
    }

    return (
        <div className="flex h-full flex-col bg-surface-menu-bar">
            <div ref={setScrollerRef} className="min-h-0 flex-1 overflow-auto p-2 pb-12">
                <ul className="flex flex-col gap-0.5">
                    {data.groupedChannels.map(([groupName, channels]) => (
                        <Collapsible
                            open={isGroupOpen(groupName, channels.length > 0)}
                            onOpenChange={(open) => setOpenGroups(prev => ({ ...prev, [groupName]: open }))}
                            key={groupName}
                            asChild
                            className="group/collapsible"
                        >
                            <li>
                                <CollapsibleTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-ink-gray-7 outline-none transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-8"
                                    >
                                        <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        <ChannelGroupLabel groupName={groupName} />
                                    </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <ul className="ml-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-outline-gray-1 px-2 py-0.5">
                                        {channels.map((channel) => (
                                            <li key={channel.name}>
                                                <PreviewRow channel={channel} />
                                            </li>
                                        ))}
                                    </ul>
                                </CollapsibleContent>
                            </li>
                        </Collapsible>
                    ))}
                </ul>

                {scrollerRef && <Virtuoso
                    customScrollParent={scrollerRef}
                    data={data.ungroupedChannels}
                    computeItemKey={(_index, channel) => channel.name}
                    itemContent={(_index, channel) => <PreviewRow channel={channel} />}
                />}
            </div>
        </div>
    )
}

const PreviewRow = ({ channel }: { channel: ChannelSidebarData['ungroupedChannels'][number] }) => (
    <div className="flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-ink-gray-7">
        <ChannelIcon type={channel.type || "Public"} className="h-4 w-4 shrink-0" />
        <span className="truncate">{channel.channel_name}</span>
    </div>
)
