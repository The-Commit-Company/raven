import { useLocation } from "react-router-dom";
import CommandMenu from "../cmdk/CommandMenu";
import SearchButton from "./QuickSearch/SearchButton";
import { SidebarTrigger } from "@components/ui/sidebar";

interface AppHeaderProps {
    title?: string
}

const AppHeader = ({ title }: AppHeaderProps) => {
    const location = useLocation()
    const pathname = location.pathname
    const isSearchPage = pathname === "/search"

    return (
        <header className="flex items-center gap-1 border-b bg-surface-white z-10 px-2 shrink-0 h-(--app-header-height) w-full">
            {/* Mobile sidebar trigger */}
            <SidebarTrigger className="md:hidden shrink-0" />

            {/* Page title (optional) */}
            {title && (
                <h1 className="text-base font-medium text-ink-gray-9 px-2 shrink-0">{title}</h1>
            )}

            {/* Search — hidden on mobile (SearchButton is fixed w-150 and blocks the trigger).
                On /search the page renders its own in-page input — no header SearchBar. */}
            <div className="hidden md:flex flex-1 items-center justify-end gap-1">
                {!isSearchPage && <SearchButton />}
            </div>

            {/* Balance spacer */}
            <div className="hidden md:flex flex-1" />
            <CommandMenu />
        </header>
    )
}

export default AppHeader
