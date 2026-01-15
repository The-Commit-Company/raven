import * as React from "react"
import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader } from "@components/ui/sidebar"
import { Label } from "@components/ui/label"
import { Switch } from "@components/ui/switch"
import { DMListItem } from "../common/DMListItem/DMListItem"
import { UserFields } from "@raven/types/common/UserFields"

interface DMSidebarProps {
    workspaceName: string
    mails: (UserFields & { email: string; date: string; teaser: string; unread: number })[]
    activeDM: string | null
    onDMClick: (email: string) => void
}

export function DMSidebar({ workspaceName, mails, activeDM, onDMClick }: DMSidebarProps) {
    return (
        <>
            <SidebarHeader className="h-[36px] gap-2 px-3 border-b flex items-center">
                <div className="flex items-center justify-between w-full">
                    <div className="text-sm font-medium text-foreground truncate">
                        {workspaceName}
                    </div>
                    <Label className="flex items-center gap-2 text-[12px]">
                        <span>Unreads</span>
                        <Switch className="shadow-none" />
                    </Label>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="p-0">
                    <SidebarGroupContent>
                        {mails.map((mail) => (
                            <DMListItem
                                key={mail.email}
                                user={mail as UserFields}
                                date={mail.date}
                                teaser={mail.teaser}
                                unread={mail.unread}
                                isActive={activeDM === mail.email}
                                onClick={(e) => {
                                    e.preventDefault()
                                    onDMClick(mail.email)
                                }}
                            />
                        ))}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </>
    )
}
