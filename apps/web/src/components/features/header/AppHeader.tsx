import UserHelpMenu from "./UserHelpMenu/UserHelpMenu";
import SearchBar from "./QuickSearch/SearchBar";
import { useLocation } from "react-router-dom";
import { useSidebar } from "@components/ui/sidebar";

interface AppHeaderProps {
    searchValue?: string
    onSearchChange?: (value: string) => void
}

const AppHeader = ({ searchValue, onSearchChange }: AppHeaderProps) => {

    const location = useLocation()
    const isSearchPage = location.pathname === "/search"
    const isThreadsPage = location.pathname === "/threads"
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"

    return (
        <header
            className="flex items-center justify-between border-b bg-background z-10 px-2 fixed top-0 h-[36px] transition-[left,width] duration-200 ease-linear"
            style={{
                left: isThreadsPage
                    ? "var(--workspace-switcher-width, 60px)"
                    : (isCollapsed
                        ? "var(--sidebar-width-icon, 60px)"
                        : "var(--sidebar-width, 340px)"),
                width: isThreadsPage
                    ? "calc(100% - var(--workspace-switcher-width, 60px))"
                    : (isCollapsed
                        ? "calc(100% - var(--sidebar-width-icon, 60px))"
                        : "calc(100% - var(--sidebar-width, 340px))"),
            }}
        >
            {/* Left section - empty for balance */}
            <div className="flex-1" />

            {/* Centered search bar section */}
            <div className="flex flex-1 items-center justify-center max-w-xl w-full gap-1">
                {isSearchPage ? (
                    <SearchBar value={searchValue || ""} onChange={onSearchChange || (() => { })} />
                ) : (
                    <SearchBar value={""} onChange={() => { }} />
                )}
                <UserHelpMenu />
            </div>

            {/* Right section - empty for balance */}
            <div className="flex-1" />
        </header>
    )
}

export default AppHeader
