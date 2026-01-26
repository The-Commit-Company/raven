import { useState } from "react"
import { WorkspaceSwitcher } from "@components/workspace-switcher/WorkspaceSwitcher"
import { Sidebar, SidebarProvider, SidebarInset, useSidebar } from "@components/ui/sidebar"
import { DMSidebar } from "@components/dm-sidebar/DMSidebar"
import { UserFields } from "@raven/types/common/UserFields"

// Sample data for direct messages
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
        teaser: "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
        unread: 3,
    },
    {
        name: "Marcus Rodriguez",
        full_name: "Marcus Rodriguez",
        user_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        email: "marcus.rodriguez@company.com",
        type: "User",
        date: "Yesterday",
        teaser: "Thanks for the update, this is a good start.\nLet's schedule a call to discuss the next steps.",
        unread: 0,
    },
    {
        name: "Priya Patel",
        full_name: "Priya Patel",
        user_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        email: "priya.patel@company.com",
        type: "User",
        date: "2 days ago",
        teaser: "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
        unread: 15,
    },
    {
        name: "David Kim",
        full_name: "David Kim",
        user_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        email: "david.kim@company.com",
        type: "User",
        date: "2 days ago",
        teaser: "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
        unread: 0,
    },
    {
        name: "Lisa Thompson",
        full_name: "Lisa Thompson",
        user_image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        email: "lisa.thompson@company.com",
        type: "User",
        date: "1 week ago",
        teaser: "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
        unread: 1,
    },
]

const DirectMessagesHeader = () => {
    // Direct messages sidebar is always expanded (not collapsible)
    // Total sidebar width: Workspace switcher (60px) + DMSidebar (360px) = 420px
    const headerLeft = "420px"
    const headerWidth = "calc(100% - 420px)"

    return (
        <>
            <header 
                className="flex items-center justify-between border-b bg-background py-1.5 px-2 z-10 fixed top-0 h-[36px]"
                style={{
                    left: headerLeft,
                    width: headerWidth,
                }}
            >
                <div className="flex items-center gap-4">
                    <span className="text-md font-medium">Direct Messages</span>
                </div>
            </header>
            <div className="pt-[36px] flex-1 overflow-auto">
                {/* Content area - add your direct messages content here */}
            </div>
        </>
    )
}

export default function DirectMessages() {
    const [mails] = useState<MailItem[]>(sampleMails)
    const [activeDM, setActiveDM] = useState<string | null>(null)

    return (
        <div className="flex flex-col h-full overflow-hidden" style={{ "--workspace-switcher-width": "60px", "--sidebar-width": "420px" } as React.CSSProperties}>
            <SidebarProvider
                style={{
                    "--sidebar-width": "420px",
                    "--sidebar-width-icon": "60px",
                } as React.CSSProperties}
            >
                <Sidebar className="overflow-hidden h-full" data-state="expanded">
                    <div className="flex h-full *:data-[sidebar=sidebar]:flex-row">
                        <WorkspaceSwitcher />
                        <div className="flex-1 flex flex-col">
                            <DMSidebar
                                workspaceName="Direct Messages"
                                mails={mails}
                                activeDM={activeDM}
                                onDMClick={(email) => setActiveDM(email)}
                            />
                        </div>
                    </div>
                </Sidebar>
                <SidebarInset className="flex flex-col overflow-hidden">
                    <DirectMessagesHeader />
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
