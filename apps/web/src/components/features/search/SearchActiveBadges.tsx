import { X } from 'lucide-react'
import { Badge } from '@components/ui/badge'
import { SearchFilters } from './types'
import { UserData } from "@db"
import { ChannelListItem, DMChannelListItem } from '@raven/types/common/ChannelListItem'
import { useSearchParams } from 'react-router-dom'
import _ from '@lib/translate'

interface FilterBadgeProps {
    label: string
    onRemove: () => void
}

function FilterBadge({ label, onRemove }: FilterBadgeProps) {
    return (
        <Badge
            variant="subtle"
            size="md"
            theme="gray"
            className="cursor-pointer mb-2"
            onClick={onRemove}>
            {label}
            <X />
        </Badge>
    )
}

const FILE_TYPE_LABELS: Record<string, string> = {
    pdf: 'PDFs',
    doc: 'Documents',
    ppt: 'Presentations',
    xls: 'Spreadsheets',
    image: 'Images',
}

export function SearchActiveBadges({ filters, channels, dmChannels, users }: { filters: SearchFilters, channels: ChannelListItem[], dmChannels: DMChannelListItem[], users: UserData[] }) {

    const [, setSearchParams] = useSearchParams()

    if (!filters) return null

    const removeParam = (key: string) => () => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev)
            params.delete(key)
            return params
        }, { replace: true })
    }

    return (
        <div className="flex flex-wrap gap-2">
            {filters.channel_id && filters.channel_id !== '' && (
                <FilterBadge
                    label={_('Channel: {0}', [(channels.find(c => c.name === filters.channel_id)?.channel_name || dmChannels.find(dc => dc.name === filters.channel_id)?.peer_user_id) ?? filters.channel_id])}
                    onRemove={removeParam('channel')}
                />
            )}

            {filters.owner && filters.owner !== '' && (
                <FilterBadge
                    label={_('User: {0}', [users.find(u => u.name === filters.owner)?.full_name ?? filters.owner])}
                    onRemove={removeParam('user')}
                />
            )}

            {filters.file_type && filters.file_type.length > 0 && (
                <FilterBadge
                    label={filters.file_type.length === 1
                        ? _('File: {0}', [FILE_TYPE_LABELS[filters.file_type[0]] ?? filters.file_type[0]])
                        : _('File: {0} types', [String(filters.file_type.length)])}
                    onRemove={removeParam('file_type')}
                />
            )}

            {filters.channel_type && filters.channel_type !== '' && (
                <FilterBadge
                    label={_('Channel type: {0}', [filters.channel_type])}
                    onRemove={removeParam('channel_type')}
                />
            )}

            {filters.is_direct_message === 1 && (
                <FilterBadge label={_('Direct Messages')} onRemove={removeParam('is_dm')} />
            )}

            {filters.is_thread_message === 1 && (
                <FilterBadge label={_('In thread')} onRemove={removeParam('is_thread_message')} />
            )}

            {filters.is_pinned === 1 && (
                <FilterBadge label={_('Pinned')} onRemove={removeParam('is_pinned')} />
            )}

            {filters.saved === 1 && (
                <FilterBadge label={_('Saved')} onRemove={removeParam('saved')} />
            )}

            {filters.has_reactions === 1 && (
                <FilterBadge label={_('Has reactions')} onRemove={removeParam('has_reactions')} />
            )}

            {filters.mentions_me === 1 && (
                <FilterBadge label={_('Mentions me')} onRemove={removeParam('mentions_me')} />
            )}
        </div>
    )
}
