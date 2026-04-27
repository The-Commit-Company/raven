import { X } from 'lucide-react'
import { Button } from '@components/ui/button'
import _ from '@lib/translate'
import { useSearchParams } from 'react-router-dom'

export function ClearFiltersButton() {
    const [, setSearchParams] = useSearchParams()
    return (
        <Button
            variant="ghost"
            onClick={() => setSearchParams((prev) => {
                const query = prev.get('q')
                const next = new URLSearchParams()
                if (query) next.set('q', query)
                return next
            })}
            className="text-muted-foreground hover:text-foreground text-xs h-7 px-2 rounded-md gap-1.5">
            <X />
            {_("Clear All")}
        </Button>
    )
} 