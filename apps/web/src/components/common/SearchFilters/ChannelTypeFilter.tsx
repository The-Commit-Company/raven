import { User } from 'lucide-react'
import { Label } from '@components/ui/label'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import { useCallback } from 'react'
import { SearchFilters } from './types'
import _ from '@lib/translate'
import { useSearchParams } from 'react-router'
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
        })
    }, [setSearchParams])

    return (
        <div>
            <Label className="text-xs text-muted-foreground mb-1 block">{_("Channel Type")}</Label>
            <Select
                value={filters.is_direct_message ? 'dm' : (filters.channel_type || '')}
                onValueChange={(value) => selectOption(value)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={_("Channel Type")} />
                </SelectTrigger>
                <SelectContent className="w-full">
                    <SelectItem value="all">
                        <span className="flex items-center gap-2">
                            {_("All")}
                        </span>
                    </SelectItem>
                    {CHANNEL_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                            <span className="flex items-center gap-2">
                                {opt.id === 'dm' ? (
                                    <User className={`h-4 w-4`} />
                                ) : (
                                    <ChannelIcon type={opt.id} className={`h-4 w-4`} />
                                )}
                                {_(opt.label)}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
} 