import * as React from "react"
import { MessageCircle } from "lucide-react"
import { Label } from "@components/ui/label"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
} from "@components/ui/sidebar"
import { Switch } from "@components/ui/switch"
import { useNavigate, useLocation } from "react-router-dom"
import { UserFields } from "@raven/types/common/UserFields"
import { ChannelSidebar } from "./channel-sidebar/ChannelSidebar"
import { DMSidebar } from "./dm-sidebar/DMSidebar"
import { ChannelListItem } from "@raven/types/common/ChannelListItem"
import { useActiveWorkspace } from "../contexts/ActiveWorkspaceContext"
import { WorkspaceSwitcher } from "./workspace-switcher/WorkspaceSwitcher"

// This is sample data
interface MailItem extends UserFields {
    email: string
    date: string
    teaser: string
    unread: number
}

export const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    workspaces: [
        {
            name: "ERPNext",
            icon: "https://frappe.io/files/erpnext53456f.png",
            isActive: true,
            color: "bg-white",
            textColor: "text-gray-900",
            notificationCount: 4,
            channels: [
                { id: "general", name: "general", type: "channel", channelType: "Public", unread: 5 },
                { id: "bugs", name: "bugs", type: "channel", channelType: "Open", unread: 0 },
                { id: "features", name: "features", type: "channel", channelType: "Private", unread: 12 },
                { id: "releases", name: "releases", type: "channel", channelType: "Public", unread: 0 },
            ],
        },
        {
            name: "Helpdesk",
            icon: "https://frappe.io/files/helpdesk8109cf.png",
            isActive: false,
            color: "bg-white",
            textColor: "text-gray-900",
            notificationCount: 5,
            channels: [
                { id: "general", name: "general", type: "channel", channelType: "Public", unread: 0 },
                { id: "academics", name: "academics", type: "channel", channelType: "Open", unread: 3 },
                { id: "research", name: "research", type: "channel", channelType: "Private", unread: 0 },
            ],
        },
        {
            name: "Frappe School",
            icon: "https://frappe.io/files/school.png",
            isActive: false,
            color: "bg-white",
            textColor: "text-gray-900",
            notificationCount: 2,
            channels: [
                { id: "general", name: "general", type: "channel", channelType: "Open", unread: 0 },
                { id: "standup", name: "standup", type: "channel", channelType: "Public", unread: 7 },
                { id: "random", name: "random", type: "channel", channelType: "Private", unread: 0 },
            ],
        },
        {
            name: "Frappe HR",
            icon: "https://frappe.io/files/hrbde4d8.png",
            isActive: false,
            color: "bg-white",
            textColor: "text-gray-900",
            notificationCount: 0,
            channels: [
                { id: "general", name: "general", type: "channel", channelType: "Public", unread: 0 },
                { id: "projects", name: "projects", type: "channel", channelType: "Open", unread: 0 },
            ],
        },
        {
            name: "Direct Messages",
            icon: MessageCircle,
            isActive: false,
            color: "bg-slate-900 dark:bg-slate-100",
            textColor: "text-slate-100 dark:text-slate-900",
            notificationCount: 0,
            channels: [
                { id: "alice", name: "Alice", type: "dm", unread: 0 },
                { id: "bob", name: "Bob", type: "dm", unread: 2 },
            ],
        },
    ],
    mails: [
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
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    // Note: I'm using state to show active workspace and channels.
    // IRL you should use the url/router.
    const [activeWorkspace, setActiveWorkspace] = React.useState(data.workspaces[0])
    const [activeChannel, setActiveChannel] = React.useState(data.workspaces[0].channels[0])
    const [mails] = React.useState<MailItem[]>(data.mails as MailItem[])
    const [activeDM, setActiveDM] = React.useState<string | null>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const { setActiveWorkspaceName } = useActiveWorkspace()

    // Get workspace from URL params
    const urlWorkspace = React.useMemo(() => {
        const match = location.pathname.match(/^\/([^/]+)\/channel\//)
        if (match) {
            return decodeURIComponent(match[1])
        }
        return null
    }, [location.pathname])

    // Update active workspace based on URL
    React.useEffect(() => {
        if (urlWorkspace) {
            const workspace = data.workspaces.find(w => w.name === urlWorkspace)
            if (workspace) {
                setActiveWorkspace(workspace)
            }
        }
    }, [urlWorkspace])

    // Update the active workspace name in context when it changes
    React.useEffect(() => {
        setActiveWorkspaceName(activeWorkspace?.name || null)
    }, [activeWorkspace, setActiveWorkspaceName])

    const handleChannelClick = (channel: ChannelListItem) => {
        setActiveChannel({
            id: channel.name,
            name: channel.channel_name,
            type: channel.type || "Public",
            unread: channel.last_message_details?.unread_count || 0
        })
        if (activeWorkspace) {
            const workspaceSlug = encodeURIComponent(activeWorkspace.name)
            const channelId = channel.name || channel.channel_name || "general"
            navigate(`/${workspaceSlug}/channel/${channelId}`)
        }
    }

    return (
        <Sidebar collapsible="icon" className="overflow-hidden h-full" {...props}>
            <div className="flex h-full *:data-[sidebar=sidebar]:flex-row">
                <WorkspaceSwitcher />

                <div className="flex-1 flex flex-col overflow-hidden">
                    {location.pathname === "/threads" || location.pathname === "/mentions" ? null : location.pathname === "/direct-messages" ? (
                        <DMSidebar
                            workspaceName="Direct Messages"
                            mails={mails}
                            activeDM={activeDM}
                            onDMClick={(email) => setActiveDM(email)}
                        />
                    ) : activeWorkspace?.name === "Direct Messages" ? (
                        <DMSidebar
                            workspaceName={activeWorkspace.name}
                            mails={mails}
                            activeDM={activeDM}
                            onDMClick={(email) => setActiveDM(email)}
                        />
                    ) : (
                        <>
                            <SidebarHeader className="h-[36px] gap-2 px-3 border-b flex items-center">
                                <div className="flex items-center justify-between w-full">
                                    <div className="text-sm font-medium text-foreground truncate">
                                        {activeWorkspace?.name}
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
                                        <ChannelSidebar
                                            activeChannelId={activeChannel?.name}
                                            onChannelClick={handleChannelClick}
                                        />
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            </SidebarContent>
                        </>
                    )}
                </div>
            </div>
        </Sidebar>
    )
}