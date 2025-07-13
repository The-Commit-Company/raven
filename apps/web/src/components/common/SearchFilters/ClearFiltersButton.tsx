import { X } from 'lucide-react'
import { Button } from '@components/ui/button'
import { FilterComponentProps } from './types'
import { clearAllFilters, hasActiveFilters } from './utils'

export function ClearFiltersButton({ filters, onFiltersChange }: FilterComponentProps) {

    if (!hasActiveFilters(filters)) {
        return null
    }

    return (
        <Button
            variant="ghost"
            onClick={() => clearAllFilters(onFiltersChange)}
            className="text-gray-500 hover:text-gray-700 text-xs h-7 px-2 rounded-md gap-1.5">
            <X />
            Clear All
        </Button>
    )
} 