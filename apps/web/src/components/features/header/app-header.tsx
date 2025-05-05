import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { AtSignIcon, BookmarkIcon, Clock, HelpCircle, Search, Settings } from "lucide-react";
import { NavUserMenu } from "../user-avatar-button/nav-user-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

export function AppHeader() {
    return (
        <header className="flex items-center justify-between border-b bg-white z-50 px-4 fixed top-0 w-full h-(--app-header-height)">
            {/* Left section - empty for balance */}
            <div className="flex-1" />

            {/* Centered search bar section */}
            <div className="flex items-center justify-center flex-1">
                <div className="flex items-center max-w-xl w-full gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Clock className="h-4 w-4" />
                                <span className="sr-only">Recents</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Recents</p>
                        </TooltipContent>
                    </Tooltip>

                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search"
                            className="pl-8 bg-gray-100 border-none h-8 w-full"
                        />
                    </div>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <HelpCircle className="h-4 w-4" />
                                <span className="sr-only">Help</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Help</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {/* Right section - actions and user menu */}
            <div className="flex items-center justify-end gap-2 flex-1">
                <div className="flex items-center gap-1">
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
    );
}