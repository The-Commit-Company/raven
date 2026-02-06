import { useState } from "react"
import SearchBar from "@components/features/header/QuickSearch/SearchBar"
import UserHelpMenu from "@components/features/header/UserHelpMenu/UserHelpMenu"

/**
 * Top bar for DM layout
 * Uses var(--sidebar-width) so it aligns with the content area
 */
export function DMTopBar() {
    const [searchValue, setSearchValue] = useState("")

    return (
        <header
            className="flex items-center justify-between border-b bg-background z-100 px-2 fixed top-0 h-[36px] transition-[left,width] duration-200 ease-linear"
            style={{
                left: "var(--sidebar-width, 380px)",
                width: "calc(100% - var(--sidebar-width, 380px))",
            }}
        >
            {/* Left - empty for balance */}
            <div className="flex-1" />
            {/* Centered search bar */}
            <div className="flex flex-1 items-center justify-center max-w-xl w-full gap-1">
                <SearchBar value={searchValue} onChange={setSearchValue} />
                <UserHelpMenu />
            </div>
            {/* Right - empty for balance */}
            <div className="flex-1" />
        </header>
    )
}
