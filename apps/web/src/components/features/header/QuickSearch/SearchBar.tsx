import { Input } from "@components/ui/input";
import { Search, X } from "lucide-react";
import React, { forwardRef, useState } from "react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ value, onChange, onBlur, onFocus, onKeyDown }, ref) => {
    const [open, setOpen] = useState(false)
    return (
        <div className="fixed left-1/2 top-5.25 -translate-x-1/2 -translate-y-1/2 w-150 z-50">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                ref={ref}
                type="search"
                placeholder="Search"
                className="pl-8 pr-8 bg-muted border-none h-7 w-full rounded-sm"
                value={value}
                onChange={e => onChange(e.target.value)}
                onBlur={onBlur}
                onFocus={() => { setOpen(true); onFocus?.() }}
                onKeyDown={onKeyDown}
            />
            {/* {value && (
                <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => onChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none">
                    <X className="h-4 w-4" />
                </button>
            )} */}

        </div>
    )
})

SearchBar.displayName = "SearchBar"

export default SearchBar