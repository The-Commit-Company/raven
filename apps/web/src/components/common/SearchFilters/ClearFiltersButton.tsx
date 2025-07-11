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
            size="sm"
            onClick={() => clearAllFilters(onFiltersChange)}
            className="text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4 mr-1" />
            Clear All
        </Button>
    )
} 