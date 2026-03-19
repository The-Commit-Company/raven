import { buildOpsRailHref, prettifyEventType, useRavenOpsFeed } from '@/hooks/useOpsMaturity'
import { commandMenuOpenAtom } from './CommandMenu'
import { Command } from 'cmdk'
import { useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { BiLinkExternal, BiPulse } from 'react-icons/bi'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

const matchesText = (text: string, values: Array<string | null | undefined>) => {
    const query = text.trim().toLowerCase()
    if (!query) return true
    return values.filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
}

const OpsCommandList = ({ text }: { text: string }) => {
    const { workspaceID, channelID } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const setOpen = useSetAtom(commandMenuOpenAtom)

    const { data } = useRavenOpsFeed(workspaceID, channelID, 6)
    const feed = data?.message
    const isRailOpen = searchParams.get('ops') === '1'

    const commandItems = useMemo(() => {
        if (!feed?.ops_channel_route_info) return []

        const items = [
            {
                key: 'ops-channel',
                label: feed.is_ops_channel && isRailOpen ? 'Hide Ops Activity' : 'Open Ops Activity',
                value: 'ops-channel',
                description: feed.ops_channel_route_info.name,
                onSelect: () => {
                    const href = buildOpsRailHref(
                        feed.ops_channel_route_info,
                        feed.events[0]?.name || null,
                    )
                    if (!href) return

                    setOpen(false)
                    if (feed.is_ops_channel && isRailOpen) {
                        const nextHref = href.replace(/[?&]ops=1(&ops_event=[^&]+)?/, '')
                        navigate(nextHref.replace(/^\/raven/, '') || '/')
                        return
                    }
                    navigate(href.replace(/^\/raven/, '') || '/')
                },
            },
        ]

        feed.events.forEach((event) => {
            items.push({
                key: `ops-event-${event.name}`,
                label: event.source?.label || event.summary,
                value: `ops-event-${event.name}`,
                description: prettifyEventType(event.event_type),
                onSelect: () => {
                    const href = buildOpsRailHref(feed.ops_channel_route_info, event.name)
                    if (!href) return
                    setOpen(false)
                    navigate(href.replace(/^\/raven/, '') || '/')
                },
            })
        })

        return items.filter((item) =>
            matchesText(text, [item.label, item.description, feed.ops_channel_route_info?.name]),
        )
    }, [feed, isRailOpen, navigate, setOpen, text])

    if (!commandItems.length) {
        return null
    }

    return (
        <Command.Group heading='Ops Maturity'>
            {commandItems.map((item) => (
                <Command.Item
                    key={item.key}
                    value={item.value}
                    onSelect={item.onSelect}
                    data-raven-command-item={item.key === 'ops-channel' ? 'ops-channel' : 'ops-event'}
                >
                    <div className='flex w-full items-center justify-between gap-3'>
                        <div className='flex items-center gap-2'>
                            {item.key === 'ops-channel' ? <BiPulse size='18' /> : <BiLinkExternal size='18' />}
                            <div className='flex flex-col'>
                                <span>{item.label}</span>
                                {item.description ? (
                                    <span className='text-xs text-gray-10'>{item.description}</span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </Command.Item>
            ))}
        </Command.Group>
    )
}

export default OpsCommandList
