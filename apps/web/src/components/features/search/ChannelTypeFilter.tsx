import { User } from 'lucide-react'
import { Label } from '@components/ui/label'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import { useCallback } from 'react'
import { SearchFilters } from './types'
import _ from '@lib/translate'
import { useSearchParams } from 'react-router-dom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'

const CHANNEL_TYPE_OPTIONS: { id: 'Public' | 'Private' | 'Open' | 'dm'; label: string }[] = [
    { id: 'Public', label: 'Public' },
    { id: 'Private', label: 'Private' },
    { id: 'Open', label: 'Open' },
    { id: 'dm', label: 'Direct Message' },
]

export function ChannelTypeFilter({ filters }: { filters: SearchFilters }) {

    const [, setSearchParams] = useSearchParams()

    const selectOption = useCallback((id: string) => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev)
            if (id === 'all') {
                params.delete('channel_type')
                params.delete('is_dm')
                params.delete('channel')
            } else if (id === 'dm') {
                params.set('is_dm', '1')
                params.delete('channel_type')
                params.delete('channel')
            } else {
                params.set('channel_type', id)
                params.delete('is_dm')
                params.delete('channel')
            }
            return params
        }, { replace: true })
    }, [setSearchParams])

    return (
        <div>
            <Label className="text-xs text-ink-gray-4 mb-1 block">{_("Channel Type")}</Label>
            <Select
                value={filters.is_direct_message ? 'dm' : (filters.channel_type || undefined)}
                onValueChange={(value) => selectOption(value)}>
                <SelectTrigger variant="outline" className="w-full">
                    <SelectValue placeholder={_("Channel Type")} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{_("All")}</SelectItem>
                    {CHANNEL_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                            {opt.id === 'dm'
                                ? <User />
                                : <ChannelIcon type={opt.id} />}
                            {_(opt.label)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
} 