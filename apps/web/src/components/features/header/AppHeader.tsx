import { Button } from "@components/ui/button";
import { AtSignIcon, BookmarkIcon, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import UserHelpMenu from "./UserHelpMenu/UserHelpMenu";
import Recents from "./RecentlyVisitedChannels/Recents";
import SearchBar from "./QuickSearch/SearchBar";
import NavUserMenu from "./NavUserMenu/NavUserMenu";
import { useNavigate, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";

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
            <div className="flex items-center justify-end gap-1.5 flex-1">
                <div className="flex items-center gap-1">
                    <NavButton
                        path="/mentions"
                        icon={AtSignIcon}
                        label="Mentions"
                    />
                    <NavButton
                        path="/saved-messages"
                        icon={BookmarkIcon}
                        label="Saved"
                    />
                    <NavButton
                        path="/settings"
                        icon={Settings}
                        label="Settings"
                    />
                </div>

                <NavUserMenu
                    user={{
                        name: "John Doe",
                        email: "john.doe@example.com",
                        avatar: "https://github.com/shadcn.png"
                    }}
                />
            </div>
        </header>
    )
}
interface NavButtonProps {
    path: string,
    icon: LucideIcon,
    label: string,
}

const NavButton = ({ path, icon: Icon, label }: NavButtonProps) => {

    const navigate = useNavigate()
    const location = useLocation()
    const isActive = location.pathname === path

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="icon"
                    className={`h-7 w-7 rounded-sm ${isActive ? "bg-secondary" : ""}`}
                    onClick={() => navigate(path)}>
                    <Icon className="h-3 w-3" />
                    <span className="sr-only">{label}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    )
}

export default AppHeader