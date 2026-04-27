import UserHelpMenu from "./UserHelpMenu/UserHelpMenu";
import SearchBar from "./QuickSearch/SearchBar";
import { useLocation } from "react-router-dom";
import CommandMenu from "../cmdk/CommandMenu";
import SearchButton from "./QuickSearch/SearchButton";

interface AppHeaderProps {
    searchValue?: string
    onSearchChange?: (value: string) => void
    /** When set, use these for header position/size (e.g. DM layout with 380px sidebar). Otherwise derive from sidebar state and route. */
    left?: string
    width?: string
}

const AppHeader = ({ searchValue, onSearchChange }: AppHeaderProps) => {
    const location = useLocation()
    const pathname = location.pathname
    const isSearchPage = pathname === "/search"

    return (
        <header
            className="flex items-center justify-between border-b bg-background z-10 px-2 fixed top-0 h-(--app-header-height) w-full transition-[left,width] duration-200 ease-linear"
        // style={{ left, width }}
        >
            {/* Centered search bar section */}
            <div className="flex flex-1 items-center justify-end w-full gap-1">
                {isSearchPage ? (
                    <SearchBar value={searchValue || ""} onChange={onSearchChange || (() => { })} />
                ) : (
                    <SearchButton />
                )}

                {/* <UserHelpMenu /> */}
            </div>

            {/* Right section - empty for balance */}
            <div className="flex-1" />
            <CommandMenu />
        </header>
    )
}

export default AppHeader
