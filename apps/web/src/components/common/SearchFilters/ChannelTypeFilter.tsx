import { User } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { Label } from '@components/ui/label'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import { SearchFilters } from './types'

export function ChannelTypeFilter({ filters }: { filters: SearchFilters }) {
    return (
        <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Channel Type</Label>
            <Select
                value={filters.channelType}
                onValueChange={(value) => console.log('channelType', value)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Channel Type" />
                </SelectTrigger>
                <SelectContent className="w-full">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="public">
                        <span className="flex items-center gap-2">
                            <ChannelIcon type="Public" className="h-4 w-4" />
                            Public
                        </span>
                    </SelectItem>
                    <SelectItem value="private">
                        <span className="flex items-center gap-2">
                            <ChannelIcon type="Private" className="h-4 w-4" />
                            Private
                        </span>
                    </SelectItem>
                    <SelectItem value="open">
                        <span className="flex items-center gap-2">
                            <ChannelIcon type="Open" className="h-4 w-4" />
                            Open
                        </span>
                    </SelectItem>
                    <SelectItem value="dm">
                        <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Direct Message
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
} 