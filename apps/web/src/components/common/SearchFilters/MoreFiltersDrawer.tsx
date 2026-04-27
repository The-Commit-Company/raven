import { ListFilter, X } from 'lucide-react'
import { Button } from '@components/ui/button'
import { FileTypeFilter } from './FileTypeFilter'
import { ChannelTypeFilter } from './ChannelTypeFilter'
import { Checkbox } from '@components/ui/checkbox'
import { Label } from '@components/ui/label'
import { SearchFilters } from './types'
import _ from '@lib/translate'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

interface MoreFiltersDrawerProps {
    filters: SearchFilters,
    onClose: () => void
}

export function MoreFiltersDrawer({ filters, onClose }: MoreFiltersDrawerProps) {

    const [, setSearchParams] = useSearchParams()

    const toggleBooleanParam = (key: string) => (checked: boolean) => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev)
            if (checked) params.set(key, '1')
            else params.delete(key)
            return params
        })
    }

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    return (
        <div className="flex flex-col h-full px-4 py-3 max-w-md w-85">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <ListFilter className="w-5 h-5" />
                    <h2 className="text-lg font-medium">{_("Filters")}</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                    <X className="w-5 h-5" />
                </Button>
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto">
                {/* File Type Filter */}
                <FileTypeFilter filters={filters} />
                {/* Channel Type Filter */}
                <ChannelTypeFilter filters={filters} />
                {/* Message Properties */}
                <div className="space-y-6">
                    <div>
                        <Label className="text-xs text-muted-foreground mb-3 block">{_("Message is...")}</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <Checkbox checked={filters.is_thread_message === 1} onCheckedChange={checked => toggleBooleanParam('is_thread_message')(checked === true)} />
                                <Label htmlFor="is_thread_message" className="font-normal">{_("In a thread")}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox checked={filters.saved === 1} onCheckedChange={checked => toggleBooleanParam('saved')(checked === true)} />
                                <Label htmlFor="saved" className="font-normal">{_("Saved")}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox checked={filters.is_pinned === 1} onCheckedChange={checked => toggleBooleanParam('is_pinned')(checked === true)} />
                                <Label htmlFor="pinned" className="font-normal">{_("Pinned")}</Label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground mb-3 block">{_("Message has...")}</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <Checkbox id="has_link" checked={filters.has_link === 1} onCheckedChange={checked => toggleBooleanParam('has_link')(checked === true)} />
                                <Label htmlFor="has_link" className="font-normal">{_("A link")}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="hasReactions" checked={filters.has_reactions === 1} onCheckedChange={checked => toggleBooleanParam('has_reactions')(checked === true)} />
                                <Label htmlFor="hasReactions" className="font-normal">{_("Reactions")}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="mentions" checked={filters.mentions_me === 1} onCheckedChange={checked => toggleBooleanParam('mentions_me')(checked === true)} />
                                <Label htmlFor="mentions" className="font-normal">{_("Mention")}</Label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 