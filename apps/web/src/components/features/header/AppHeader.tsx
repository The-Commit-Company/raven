import UserHelpMenu from "./UserHelpMenu/UserHelpMenu";
import SearchBar from "./QuickSearch/SearchBar";
import { useSidebar } from "@components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { SIDEBAR_LESS_ROUTES } from "@utils/routes";

interface AppHeaderProps {
    searchValue?: string
    onSearchChange?: (value: string) => void
    /** When set, use these for header position/size (e.g. DM layout with 380px sidebar). Otherwise derive from sidebar state and route. */
    left?: string
    width?: string
}

const AppHeader = ({ searchValue, onSearchChange, left: leftProp, width: widthProp }: AppHeaderProps) => {
    const location = useLocation()
    const navigate = useNavigate()
    const pathname = location.pathname
    const isSearchPage = pathname === "/search"
    const isSettingsPage = pathname.startsWith("/settings")
    const isSidebarLessPage = SIDEBAR_LESS_ROUTES.has(pathname) || isSettingsPage
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"

    const left = leftProp ?? (isSidebarLessPage
        ? "var(--workspace-switcher-width, 60px)"
        : (isCollapsed ? "var(--sidebar-width-icon, 60px)" : "var(--sidebar-width, 340px)"))
    const width = widthProp ?? (isSidebarLessPage
        ? "calc(100% - var(--workspace-switcher-width, 60px))"
        : (isCollapsed ? "calc(100% - var(--sidebar-width-icon, 60px))" : "calc(100% - var(--sidebar-width, 340px))"))

    return (
        <header
            className="flex items-center justify-between border-b bg-background z-10 px-2 fixed top-0 h-[36px] transition-[left,width] duration-200 ease-linear"
            style={{ left, width }}
        >
            {/* Left section - empty for balance */}
            <div className="flex-1" />

            {/* Centered search bar section */}
            <div className="flex flex-1 items-center justify-center max-w-xl w-full gap-1">
                {isSearchPage ? (
                    <SearchBar value={searchValue || ""} onChange={onSearchChange || (() => { })} />
                ) : (
                    <SearchBar value={""} onChange={() => { }} onFocus={() => navigate("/search")} />
                )}
                <UserHelpMenu />
            </div>

            {/* Right section - empty for balance */}
            <div className="flex-1" />
        </header>
    )
}

export default AppHeader
