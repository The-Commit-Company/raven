import { Input } from "@components/ui/input";
import { Search, X } from "lucide-react";
import React from "react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
    return (
        <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search"
                className="pl-8 pr-8 bg-muted border-none h-7 w-full rounded-sm"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
            {value && (
                <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => onChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none">
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}

export default SearchBar