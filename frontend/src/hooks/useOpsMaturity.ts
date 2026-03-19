import { useFrappeGetCall } from 'frappe-react-sdk'

export interface OMRouteInfo {
    app?: string | null
    doctype: string
    name: string
    surface: string
    app_route?: string | null
    desk_route?: string[] | null
    web_route?: string | null
}

export interface RavenOpsRouteItem {
    label: string
    description?: string | null
    route_info?: OMRouteInfo | null
}

export interface RavenOpsEventSource {
    doctype?: string | null
    name?: string | null
    label?: string | null
    status?: string | null
    number?: number | null
    url?: string | null
}

export interface RavenOpsEvent {
    name: string
    event_type: string
    status: string
    summary: string
    modified?: string | null
    processed_at?: string | null
    channel_id?: string | null
    channel_name?: string | null
    target_doctype?: string | null
    target_name?: string | null
    target_route_info?: OMRouteInfo | null
    repository?: string | null
    repository_route_info?: OMRouteInfo | null
    source?: RavenOpsEventSource | null
    changes?: Record<string, any> | null
    related_routes?: RavenOpsRouteItem[]
}

export interface RavenOpsChannel {
    name: string
    label: string
    workspace?: string | null
    route_info?: OMRouteInfo | null
    count: number
    latest_summary?: string | null
    latest_event_type?: string | null
}

export interface RavenOpsFeed {
    ops_channel_route_info?: OMRouteInfo | null
    is_ops_channel: boolean
    channels: RavenOpsChannel[]
    events: RavenOpsEvent[]
}

export function routeInfoToHref(routeInfo?: OMRouteInfo | null) {
    if (!routeInfo) return ''
    if (routeInfo.app_route) return routeInfo.app_route
    if (routeInfo.web_route) return routeInfo.web_route

    const slug = routeInfo.doctype.toLowerCase().replace(/\s+/g, '-')
    return `/app/${slug}/${encodeURIComponent(routeInfo.name)}`
}

export function buildOpsRailHref(routeInfo?: OMRouteInfo | null, eventName?: string | null) {
    const href = routeInfoToHref(routeInfo)
    if (!href) return ''

    const url = new URL(href, window.location.origin)
    url.searchParams.set('ops', '1')
    if (eventName) {
        url.searchParams.set('ops_event', eventName)
    }
    return `${url.pathname}${url.search}`
}

export function navigateToRouteInfo(
    navigate: (to: string) => void,
    routeInfo?: OMRouteInfo | null,
) {
    const href = routeInfoToHref(routeInfo)
    if (!href) return

    if (href.startsWith('/raven/')) {
        navigate(href.replace(/^\/raven/, '') || '/')
        return
    }

    window.location.assign(href)
}

export function formatRavenOpsTimestamp(value?: string | null) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date)
}

export function prettifyEventType(eventType?: string | null) {
    return (eventType || '')
        .replace(/^raven\./, '')
        .split(/[._]/g)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
}

export function summarizeEventChange(changes?: Record<string, any> | null) {
    if (!changes) return []

    return Object.entries(changes).map(([field, value]) => {
        const label = field.replace(/_/g, ' ')
        if (value && typeof value === 'object' && ('from' in value || 'to' in value)) {
            const fromValue = value.from || 'Unset'
            const toValue = value.to || 'Unset'
            return `${label}: ${fromValue} -> ${toValue}`
        }
        return `${label}: ${String(value)}`
    })
}

export function useRavenOpsFeed(workspaceID?: string, channelID?: string, limit = 12) {
    const cacheKey = workspaceID
        ? `raven_ops_feed:${workspaceID}:${channelID || 'all'}:${limit}`
        : null

    return useFrappeGetCall<{ message: RavenOpsFeed }>(
        'ops_maturity.api.get_raven_ops_feed',
        {
            workspace: workspaceID,
            channel: channelID,
            limit,
        },
        cacheKey,
        {
            revalidateOnFocus: true,
            keepPreviousData: true,
        },
    )
}
