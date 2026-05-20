import { Input } from "@components/ui/input";
import { Search, X } from "lucide-react";
import { forwardRef } from "react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ value, onChange }, ref) => {
    return (
        <div className="fixed left-1/2 top-5.25 -translate-x-1/2 -translate-y-1/2 w-150 z-50">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-gray-4" />
            <Input
                ref={ref}
                type="search"
                placeholder="Search"
                variant="subtle"
                inputSize="sm"
                className="pl-8 pr-8"
                value={value}
                onChange={e => onChange(e.target.value)}
                autoFocus
                aria-label="Search"
            />
            {value && (
                <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => onChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-gray-4 hover:text-ink-gray-8 focus:outline-none">
                    <X className="h-4 w-4" />
                </button>
            )}

        </div>
    )
})

SearchBar.displayName = "SearchBar"

export default SearchBar