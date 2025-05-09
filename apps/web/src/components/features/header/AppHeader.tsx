import { Button } from "@components/ui/button";
import { AtSignIcon, BookmarkIcon, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import UserHelpMenu from "./UserHelpMenu/UserHelpMenu";
import Recents from "./RecentlyVisitedChannels/Recents";
import SearchBar from "./QuickSearch/SearchBar";
import NavUserMenu from "./NavUserMenu/NavUserMenu";

const AppHeader = () => {
    return (
        <header className="flex items-center justify-between border-b bg-background z-50 px-2 fixed top-0 w-full h-(--app-header-height)">

            {/* Left section - empty for balance */}
            <div className="flex-1" />

            {/* Centered search bar section */}
            <div className="flex flex-1 items-center justify-center max-w-xl w-full gap-1">
                <Recents />
                <SearchBar />
                <UserHelpMenu />
            </div>

            {/* Right section - actions and user menu */}
            <div className="flex items-center justify-end gap-2 flex-1">
                <div className="flex items-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <AtSignIcon className="h-4 w-4" />
                                <span className="sr-only">Mentions</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Mentions</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <BookmarkIcon className="h-4 w-4" />
                                <span className="sr-only">Saved</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Saved</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">Settings</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Settings</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                <NavUserMenu
                    user={{
                        name: "John Doe",
                        email: "john.doe@example.com",
                        avatar: "/placeholder-user.jpg"
                    }}
                />
            </div>
        </header>
    )
}

export default AppHeader