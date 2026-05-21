import SearchBar from "./QuickSearch/SearchBar";
import { useLocation } from "react-router-dom";
import CommandMenu from "../cmdk/CommandMenu";
import SearchButton from "./QuickSearch/SearchButton";
import { SidebarTrigger } from "@components/ui/sidebar";

interface AppHeaderProps {
    searchValue?: string
    onSearchChange?: (value: string) => void
}

const AppHeader = ({ searchValue, onSearchChange }: AppHeaderProps) => {
    const location = useLocation()
    const pathname = location.pathname
    const isSearchPage = pathname === "/search"

    return (
        <header className="flex items-center gap-1 border-b bg-surface-white z-10 px-2 fixed top-0 h-(--app-header-height) w-full">
            {/* Mobile sidebar trigger */}
            <SidebarTrigger className="md:hidden shrink-0" />

            {/* Search — hidden on mobile (SearchButton is fixed w-150 and blocks the trigger) */}
            <div className="hidden md:flex flex-1 items-center justify-end gap-1">
                {isSearchPage ? (
                    <SearchBar value={searchValue || ""} onChange={onSearchChange || (() => { })} />
                ) : (
                    <SearchButton />
                )}
            </div>

            {/* Balance spacer */}
            <div className="hidden md:flex flex-1" />
            <CommandMenu />
        </header>
    )
}

export default AppHeader
