import { ListFilter, X } from 'lucide-react'
import { Button } from '@components/ui/button'
import { FilterComponentProps } from './types'
import { updateFilter } from './utils'
import { FileTypeFilter } from './FileTypeFilter'
import { ChannelTypeFilter } from './ChannelTypeFilter'
import { Checkbox } from '@components/ui/checkbox'
import { Label } from '@components/ui/label'

interface MoreFiltersProps extends FilterComponentProps {
    onClose: () => void
}

export function MoreFilters({ filters, onFiltersChange, availableChannels, availableUsers, onClose }: MoreFiltersProps) {
    return (
        <div className="flex flex-col h-full px-4 py-3 max-w-md w-[340px]">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <ListFilter className="w-5 h-5" />
                    <h2 className="text-lg font-medium">Filters</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                    <X className="w-5 h-5" />
                </Button>
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto">
                {/* File Type Filter */}
                <FileTypeFilter
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    availableChannels={availableChannels}
                    availableUsers={availableUsers}
                />
                {/* Channel Type Filter */}
                <ChannelTypeFilter
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    availableChannels={availableChannels}
                    availableUsers={availableUsers}
                />
                {/* Message Properties */}
                <div className="space-y-6">
                    <div>
                        <Label className="text-xs text-muted-foreground mb-3 block">Message is...</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <Checkbox id="isDirectMessage" checked={filters.isDirectMessage === true} onCheckedChange={checked => updateFilter(filters, 'isDirectMessage', checked ? true : null, onFiltersChange)} />
                                <Label htmlFor="isDirectMessage" className="font-normal">A direct message</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="inThread" checked={filters.inThread === true} onCheckedChange={checked => updateFilter(filters, 'inThread', checked ? true : null, onFiltersChange)} />
                                <Label htmlFor="inThread" className="font-normal">In a thread</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="isSaved" checked={filters.isSaved === true} onCheckedChange={checked => updateFilter(filters, 'isSaved', checked ? true : null, onFiltersChange)} />
                                <Label htmlFor="isSaved" className="font-normal">Saved</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="isPinned" checked={filters.isPinned === true} onCheckedChange={checked => updateFilter(filters, 'isPinned', checked ? true : null, onFiltersChange)} />
                                <Label htmlFor="isPinned" className="font-normal">Pinned</Label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground mb-3 block">Message has...</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <Checkbox id="hasLink" checked={filters.hasLink === true} onCheckedChange={checked => updateFilter(filters, 'hasLink', checked ? true : null, onFiltersChange)} />
                                <Label htmlFor="hasLink" className="font-normal">A link</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="hasReactions" checked={filters.hasReactions === true} onCheckedChange={checked => updateFilter(filters, 'hasReactions', checked ? true : null, onFiltersChange)} />
                                <Label htmlFor="hasReactions" className="font-normal">Reactions</Label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <Button variant="default" onClick={onClose}>Done</Button>
            </div>
        </div>
    )
} 