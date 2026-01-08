import * as React from "react"
import { Plus, MessageCircle, AtSignIcon, MessageSquareText, BookmarkIcon } from "lucide-react"
import { Label } from "@components/ui/label"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    useSidebar,
} from "@components/ui/sidebar"
import { Switch } from "@components/ui/switch"
import { cn } from "@lib/utils"
import { useNavigate, useLocation } from "react-router-dom"
import { UserFields } from "@raven/types/common/UserFields"
import { DMListItem } from "./common/DMListItem/DMListItem"
import { ChannelSidebar } from "./channel-sidebar/ChannelSidebar"
import { ChannelListItem } from "@raven/types/common/ChannelListItem"
import { ChannelSidebarData } from "../types/ChannelGroup"
import { erpNextData, helpdeskData, frappeSchoolData, frappeHRData } from "../data/channelSidebarData"
import NavUserMenu from "./features/header/NavUserMenu/NavUserMenu"

// This is sample data
interface MailItem extends UserFields {
    email: string
    date: string
    teaser: string
    unread: number
}

const data = {
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
    const { setOpen } = useSidebar()
    const navigate = useNavigate()
    const location = useLocation()


    // Get channel data based on active workspace
    const [channelSidebarData, setChannelSidebarData] = React.useState<ChannelSidebarData>(() => {
        switch (activeWorkspace?.name) {
            case 'ERPNext':
                return erpNextData
            case 'Helpdesk':
                return helpdeskData
            case 'Frappe School':
                return frappeSchoolData
            case 'Frappe HR':
                return frappeHRData
            default:
                return erpNextData
        }
    })

    // Update channel data when workspace changes
    React.useEffect(() => {
        switch (activeWorkspace?.name) {
            case 'ERPNext':
                setChannelSidebarData(erpNextData)
                break
            case 'Helpdesk':
                setChannelSidebarData(helpdeskData)
                break
            case 'Frappe School':
                setChannelSidebarData(frappeSchoolData)
                break
            case 'Frappe HR':
                setChannelSidebarData(frappeHRData)
                break
            default:
                setChannelSidebarData(erpNextData)
        }
    }, [activeWorkspace?.name])

    const handleChannelClick = (channel: ChannelListItem) => {
        setActiveChannel({
            id: channel.name,
            name: channel.channel_name,
            type: channel.type || "Public",
            unread: channel.last_message_details?.unread_count || 0
        })
    }

    return (
        <Sidebar collapsible="icon" className="overflow-hidden" {...props}>
            <div className="flex h-full *:data-[sidebar=sidebar]:flex-row">
                <div className="w-[60px] border-r border-border/40 bg-sidebar shrink-0 relative group/workspace-sidebar flex flex-col">
                    <div className="flex flex-col items-center gap-3 py-4 flex-1">
                        {data.workspaces.map((workspace) => (
                            <div
                                key={workspace.name}
                                className="relative group/workspace-item cursor-pointer w-full flex justify-center"
                                onClick={() => {
                                    setActiveWorkspace(workspace)
                                    setActiveChannel(workspace.channels[0])
                                    setOpen(true)
                                }}
                            >
                                <div
                                    className={cn(
                                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200",
                                        activeWorkspace?.name === workspace.name
                                            ? "h-8 bg-foreground"
                                            : "h-2 bg-transparent group-hover/workspace-item:bg-foreground/60 group-hover/workspace-item:h-2",
                                    )}
                                />

                                <div
                                    className={cn(
                                        "relative flex items-center justify-center w-8 h-8 transition-all duration-200 shadow-sm rounded-md",
                                        workspace.color,
                                        activeWorkspace?.name === workspace.name && "shadow-md",
                                    )}
                                >
                                    {typeof workspace.icon === 'string' ? (
                                        <img
                                            src={workspace.icon}
                                            alt={workspace.name}
                                            className="w-8 h-8 object-cover rounded-md"
                                        />
                                    ) : workspace.name === "Direct Messages" ? (
                                        <span className={cn("text-[10px] font-semibold", workspace.textColor)}>
                                            DMs
                                        </span>
                                    ) : (
                                        <workspace.icon className={cn("w-3.5 h-3.5", workspace.textColor)} />
                                    )}
                                    {workspace.notificationCount > 0 && (
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-unread rounded-full w-2 h-2 shadow-lg border border-slate-200 dark:border-slate-800" />
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="relative group cursor-pointer mt-2">
                            <div className="flex items-center justify-center w-8 h-8 bg-background border-2 border-dashed border-muted-foreground/25 text-muted-foreground rounded-md hover:border-muted-foreground/50 hover:text-foreground transition-all duration-200">
                                <Plus className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center pb-4">
                        <NavUserMenu
                            user={{
                                name: "John Doe",
                                email: "john.doe@example.com",
                                avatar: "https://github.com/shadcn.png"
                            }}
                        />
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <SidebarHeader className="gap-2 p-3 border-b">
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center justify-between w-full">
                                <div className="text-sm font-medium text-foreground truncate">
                                    {activeWorkspace?.name}
                                </div>
                                <Label className="flex items-center gap-2 text-[12px]">
                                    <span>Unreads</span>
                                    <Switch className="shadow-none" />
                                </Label>
                            </div>
                            <div className="flex items-center gap-1 w-full">
                                <div
                                    onClick={() => navigate("/threads")}
                                    className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded-md border cursor-pointer transition-colors text-xs font-medium ${location.pathname === "/threads"
                                        ? "bg-secondary border-border"
                                        : "bg-background border-border hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                >
                                    <MessageSquareText className="h-3 w-3" />
                                    <span>Threads</span>
                                </div>
                                <div
                                    onClick={() => navigate("/saved-messages")}
                                    className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded-md border cursor-pointer transition-colors text-xs font-medium ${location.pathname === "/saved-messages"
                                        ? "bg-secondary border-border"
                                        : "bg-background border-border hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                >
                                    <BookmarkIcon className="h-3 w-3" />
                                    <span>Saved</span>
                                </div>
                                <div
                                    onClick={() => navigate("/mentions")}
                                    className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded-md border cursor-pointer transition-colors text-xs font-medium ${location.pathname === "/mentions"
                                        ? "bg-secondary border-border"
                                        : "bg-background border-border hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                >
                                    <AtSignIcon className="h-3 w-3" />
                                    <span>Mentions</span>
                                </div>
                            </div>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup className="p-0">
                            <SidebarGroupContent>
                                {activeWorkspace?.name === "Direct Messages" ? (
                                    // Direct Messages Layout
                                    mails.map((mail) => (
                                        <DMListItem
                                            key={mail.email}
                                            user={mail as UserFields}
                                            date={mail.date}
                                            teaser={mail.teaser}
                                            unread={mail.unread}
                                            isActive={activeDM === mail.email}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setActiveDM(mail.email)
                                            }}
                                        />
                                    ))
                                ) : (
                                    // New Channel Sidebar with Groups
                                    <ChannelSidebar
                                        data={channelSidebarData}
                                        activeChannelId={activeChannel?.name}
                                        onChannelClick={handleChannelClick}
                                        onDataChange={setChannelSidebarData}
                                    />
                                )}
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </div>
            </div>
        </Sidebar>
    )
}