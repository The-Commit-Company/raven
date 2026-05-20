import { commandMenuOpenAtom } from "@components/features/cmdk/atoms";
import { Search } from "lucide-react";
import { forwardRef } from "react";
import _ from "@lib/translate";
import { useSetAtom } from "jotai";

const SearchButton = forwardRef<HTMLInputElement>(() => {
    const setOpen = useSetAtom(commandMenuOpenAtom)

    return (
        <div className="fixed left-1/2 top-5.25 -translate-x-1/2 -translate-y-1/2 w-150 z-50 cursor-pointer">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-gray-4" />
            <button
                className="pl-8 bg-surface-gray-2 border-none h-7 w-full rounded-sm text-sm text-left text-ink-gray-4 cursor-pointer"
                onClick={() => setOpen(true)}
            >
                {_("Search")}
            </button>
        </div>
    )
})

SearchButton.displayName = "SearchButton"

export default SearchButton
