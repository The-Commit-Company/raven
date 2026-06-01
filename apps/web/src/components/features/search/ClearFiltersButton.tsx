import { useCallback } from 'react'
import { X } from 'lucide-react'
import { Button } from '@components/ui/button'
import _ from '@lib/translate'
import { useSearchParams } from 'react-router-dom'

/** Reset all search filters while preserving the `q` query param. */
export function useClearSearchFilters() {
    const [, setSearchParams] = useSearchParams()
    return useCallback(() => {
        setSearchParams((prev) => {
            const query = prev.get('q')
            const next = new URLSearchParams()
            if (query) next.set('q', query)
            return next
        }, { replace: true })
    }, [setSearchParams])
}

export function ClearFiltersButton() {
    const clearFilters = useClearSearchFilters()
    return (
        <Button
            variant="ghost"
            size="sm"
            aria-label={_("Clear All")}
            onClick={clearFilters}>
            <X />
            <span className="hidden md:inline">{_("Clear All")}</span>
        </Button>
    )
}
