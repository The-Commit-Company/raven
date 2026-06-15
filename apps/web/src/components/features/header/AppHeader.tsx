import { H4 } from "@components/ui/typography";
import SearchButton, { MobileSearchButton } from "./QuickSearch/SearchButton";

interface AppHeaderProps {
    // Show a title on the left side of the header
    title?: string,
    // Show an element on the left side of the header
    leftSlot?: React.ReactNode,
    // Show an element on the right side of the header
    rightSlot?: React.ReactNode,
    // Show search bar - default is true
    showSearchBar?: boolean,
}

const AppHeader = ({ title, rightSlot, leftSlot, showSearchBar = true }: AppHeaderProps) => {

    return (
        // Mobile: h-11 matches DMChannelHeader so swapping between the
        // channel list and a channel keeps the header edge steady
        <header className="flex items-center justify-between gap-1 border-b bg-surface-base z-10 px-2 shrink-0 h-11 md:h-(--app-header-height) w-full">
            <div className="flex items-center gap-2 min-w-48">
                {/* Page title (optional) */}
                <AppHeaderTitle title={title} />
                {leftSlot}
            </div>


            {/* Search — hidden on mobile (SearchButton is fixed w-150 and blocks the trigger).
                On /search the page renders its own in-page input — no header SearchBar. */}
            <div className="hidden md:flex items-center gap-1">
                {showSearchBar && <SearchButton />}
            </div>

            {/* Balance spacer */}
            <div className="min-w-48 flex justify-end items-center gap-2">
                {rightSlot}
                {showSearchBar && <MobileSearchButton />}
            </div>
        </header>
    )
}

export const AppHeaderTitle = ({ title }: { title?: string }) => {
    if (!title) return null
    return (
        <H4 className="text-base sm:text-sm font-medium">{title}</H4>
    )
}

export default AppHeader

