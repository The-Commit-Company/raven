import * as React from "react"
import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader } from "@components/ui/sidebar"
import { Label } from "@components/ui/label"
import { Switch } from "@components/ui/switch"
import { DMListItem } from "../common/DMListItem/DMListItem"
import { UserFields } from "@raven/types/common/UserFields"

// Sample data for direct messages (TODO: Replace with real API data)
interface MailItem extends UserFields {
    email: string
    date: string
    teaser: string
    unread: number
}

const sampleMails: MailItem[] = [
    {
        name: "Sarah Chen",
        full_name: "Sarah Chen",
        user_image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        email: "sarah.chen@company.com",
        type: "User",
        date: "09:34 AM",
        teaser:
            "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
        unread: 3,
    },
    {
        name: "Marcus Rodriguez",
        full_name: "Marcus Rodriguez",
        user_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        email: "marcus.rodriguez@company.com",
        type: "User",
        date: "Yesterday",
        teaser:
            "Thanks for the update, this is a good start.\nLet's schedule a call to discuss the next steps.",
        unread: 0,
    },
    {
        name: "Priya Patel",
        full_name: "Priya Patel",
        user_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        email: "priya.patel@company.com",
        type: "User",
        date: "2 days ago",
        teaser:
            "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
        unread: 15,
    },
    {
        name: "David Kim",
        full_name: "David Kim",
        user_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        email: "david.kim@company.com",
        type: "User",
        date: "2 days ago",
        teaser:
            "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
        unread: 0,
    },
    {
        name: "Lisa Thompson",
        full_name: "Lisa Thompson",
        user_image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        email: "lisa.thompson@company.com",
        type: "User",
        date: "1 week ago",
        teaser:
            "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
        unread: 1,
    },
]

interface DMSidebarProps {
    workspaceName: string
    mails?: MailItem[]
    activeDM: string | null
    onDMClick: (email: string) => void
}

export function DMSidebar({ workspaceName, mails = sampleMails, activeDM, onDMClick }: DMSidebarProps) {
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
