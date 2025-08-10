import { X } from 'lucide-react'
import { Button } from '@components/ui/button'

export function ClearFiltersButton() {
    return (
        <Button
            variant="ghost"
            onClick={() => console.log('clearAllFilters')}
            className="text-gray-500 hover:text-gray-700 text-xs h-7 px-2 rounded-md gap-1.5">
            <X />
            Clear All
        </Button>
    )
} 