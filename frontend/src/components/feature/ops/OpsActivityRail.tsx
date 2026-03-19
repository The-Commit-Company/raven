import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import BeatLoader from '@/components/layout/Loaders/BeatLoader'
import {
    formatRavenOpsTimestamp,
    navigateToRouteInfo,
    prettifyEventType,
    summarizeEventChange,
    type RavenOpsEvent,
    type RavenOpsFeed,
} from '@/hooks/useOpsMaturity'
import { Badge, Box, Button, Flex, IconButton, ScrollArea, Separator, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { useMemo } from 'react'
import { BiLinkExternal, BiX } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'

interface OpsActivityRailProps {
    feed?: RavenOpsFeed | null
    isLoading?: boolean
    error?: any
    selectedEventName?: string | null
    onSelectEvent: (eventName: string) => void
    onClose?: () => void
    compact?: boolean
}

const STATUS_COLORS: Record<string, 'gray' | 'green' | 'red' | 'amber'> = {
    Processed: 'green',
    Failed: 'red',
    Queued: 'amber',
    Skipped: 'gray',
}

export const OpsActivityRail = ({
    feed,
    isLoading,
    error,
    selectedEventName,
    onSelectEvent,
    onClose,
    compact = false,
}: OpsActivityRailProps) => {
    const navigate = useNavigate()

    const selectedEvent = useMemo(() => {
        if (!feed?.events?.length) return null
        return (
            feed.events.find((event) => event.name === selectedEventName) ||
            feed.events[0] ||
            null
        )
    }, [feed?.events, selectedEventName])

    const changeSummary = summarizeEventChange(selectedEvent?.changes)

    return (
        <aside
            data-raven-ops-rail
            className={clsx(
                'border-gray-4 dark:border-gray-6 border-l bg-gray-1/80 dark:bg-gray-1/80',
                compact ? 'border-l-0 border-t px-2 pt-2' : 'h-screen pt-16',
            )}
        >
            <ScrollArea
                type='hover'
                scrollbars='vertical'
                className={clsx(compact ? 'max-h-[24rem]' : 'h-[calc(100vh-4rem)]')}
            >
                <Flex direction='column' gap='3' p='3'>
                    <Box className='rounded-xl border border-gray-4 bg-white p-4 shadow-sm dark:border-gray-6 dark:bg-gray-2'>
                        <Flex justify='between' align='start' gap='3'>
                            <Box>
                                <Text size='1' weight='bold' color='gray'>
                                    OPS ACTIVITY
                                </Text>
                                <Text as='div' size='5' weight='medium' className='mt-1'>
                                    {feed?.ops_channel_route_info?.name || 'Recent delivery signals'}
                                </Text>
                                <Text as='p' size='2' color='gray' className='mt-2'>
                                    Task, ticket, and pull-request updates flowing through the Raven bus.
                                </Text>
                            </Box>
                            {onClose ? (
                                <IconButton
                                    type='button'
                                    variant='ghost'
                                    color='gray'
                                    onClick={onClose}
                                    aria-label='Close ops activity'
                                >
                                    <BiX size='18' />
                                </IconButton>
                            ) : null}
                        </Flex>

                        <Separator my='3' size='4' />

                        {error ? (
                            <ErrorBanner error={error} />
                        ) : isLoading ? (
                            <BeatLoader text='Loading ops activity...' />
                        ) : selectedEvent ? (
                            <SelectedEventCard event={selectedEvent} changeSummary={changeSummary} />
                        ) : (
                            <Box data-raven-ops-empty className='rounded-lg bg-gray-2 px-3 py-4 dark:bg-gray-3'>
                                <Text size='2' weight='medium'>
                                    No delivery signals yet
                                </Text>
                                <Text as='p' size='2' color='gray' className='mt-1'>
                                    When tasks change status, tickets are escalated, or pull requests are opened, delivery signals will appear here automatically.
                                </Text>
                            </Box>
                        )}
                    </Box>

                    <Box className='rounded-xl border border-gray-4 bg-white p-3 shadow-sm dark:border-gray-6 dark:bg-gray-2'>
                        <Text size='2' weight='bold'>
                            Recent Signals
                        </Text>
                        <Flex direction='column' gap='2' mt='3'>
                            {feed?.events?.length ? (
                                feed.events.map((event) => {
                                    const isActive = selectedEvent?.name === event.name
                                    return (
                                        <button
                                            key={event.name}
                                            type='button'
                                            data-raven-ops-event={event.name}
                                            onClick={() => onSelectEvent(event.name)}
                                            className={clsx(
                                                'rounded-lg border px-3 py-3 text-left transition-colors',
                                                isActive
                                                    ? 'border-blue-8 bg-blue-3 dark:border-blue-7 dark:bg-blue-3/40'
                                                    : 'border-gray-4 bg-transparent hover:border-gray-5 hover:bg-gray-2 dark:border-gray-6 dark:hover:bg-gray-3',
                                            )}
                                        >
                                            <Flex justify='between' align='start' gap='3'>
                                                <Box>
                                                    <Text size='2' weight='medium' className='block'>
                                                        {event.source?.label || event.summary}
                                                    </Text>
                                                    <Text size='1' color='gray' className='mt-1 block'>
                                                        {prettifyEventType(event.event_type)}
                                                    </Text>
                                                </Box>
                                                <Badge
                                                    color={STATUS_COLORS[event.status] || 'gray'}
                                                    variant='soft'
                                                    radius='full'
                                                >
                                                    {event.status}
                                                </Badge>
                                            </Flex>
                                            <Text size='1' color='gray' className='mt-2 block'>
                                                {formatRavenOpsTimestamp(event.processed_at || event.modified)}
                                            </Text>
                                        </button>
                                    )
                                })
                            ) : (
                                <Text size='2' color='gray'>
                                    No signals in this channel yet. Delivery events will appear here as they flow through the system.
                                </Text>
                            )}
                        </Flex>
                    </Box>
                </Flex>
            </ScrollArea>
        </aside>
    )
}

const SelectedEventCard = ({
    event,
    changeSummary,
}: {
    event: RavenOpsEvent
    changeSummary: string[]
}) => {
    const navigate = useNavigate()

    return (
        <Box data-raven-ops-detail>
            <Flex justify='between' align='center' gap='3'>
                <Badge color={STATUS_COLORS[event.status] || 'gray'} variant='soft' radius='full'>
                    {prettifyEventType(event.event_type)}
                </Badge>
                <Text size='1' color='gray'>
                    {formatRavenOpsTimestamp(event.processed_at || event.modified)}
                </Text>
            </Flex>

            <Text as='div' size='4' weight='medium' className='mt-3'>
                {event.summary}
            </Text>

            {event.source?.status ? (
                <Text as='p' size='2' color='gray' className='mt-2'>
                    Current state: {event.source.status}
                </Text>
            ) : null}

            <Flex gap='2' wrap='wrap' mt='4'>
                {event.target_route_info ? (
                    <Button
                        type='button'
                        size='2'
                        onClick={() => navigateToRouteInfo(navigate, event.target_route_info)}
                    >
                        Open {event.target_doctype || 'record'}
                    </Button>
                ) : null}
                {event.source?.url ? (
                    <Button asChild variant='soft' color='gray' size='2'>
                        <a
                            href={event.source.url}
                            target='_blank'
                            rel='noreferrer'
                            data-raven-ops-external
                        >
                            <Flex align='center' gap='1'>
                                <BiLinkExternal size='14' />
                                View source
                            </Flex>
                        </a>
                    </Button>
                ) : null}
            </Flex>

            {event.related_routes?.length ? (
                <Flex gap='2' wrap='wrap' mt='4' data-raven-ops-pills>
                    {event.related_routes.map((route) => (
                        <button
                            key={`${route.description}:${route.label}`}
                            type='button'
                            data-raven-ops-pill={route.label}
                            onClick={() => navigateToRouteInfo(navigate, route.route_info)}
                            className='rounded-full border border-gray-5 bg-gray-2 px-3 py-1.5 text-xs font-medium text-gray-12 transition-colors hover:border-gray-6 hover:bg-gray-3 dark:border-gray-6 dark:bg-gray-3 dark:hover:bg-gray-4'
                        >
                            {route.label}
                        </button>
                    ))}
                </Flex>
            ) : null}

            {changeSummary.length ? (
                <Box className='mt-4 rounded-lg bg-gray-2 px-3 py-3 dark:bg-gray-3'>
                    <Text size='2' weight='medium'>
                        Changes
                    </Text>
                    <Flex direction='column' gap='1' mt='2'>
                        {changeSummary.map((line) => (
                            <Text key={line} size='2' color='gray'>
                                {line}
                            </Text>
                        ))}
                    </Flex>
                </Box>
            ) : null}
        </Box>
    )
}
