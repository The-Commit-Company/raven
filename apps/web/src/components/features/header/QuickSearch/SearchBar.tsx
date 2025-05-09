import { Input } from "@components/ui/input";
import { Search } from "lucide-react";

const SearchBar = () => {
    return (
        <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search"
                className="pl-8 bg-muted border-none h-8 w-full"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-sm">
                ⌘+K
            </span>
        </div>
    )
}

export default SearchBar