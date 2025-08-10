import * as React from "react"
import { Command, Inbox, PlusIcon, Box } from "lucide-react"
import { Label } from "@components/ui/label"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@components/ui/sidebar"
import { Switch } from "@components/ui/switch"
import { SearchForm } from "./sidebar-search"
import { UserAvatar } from '@components/features/message/UserAvatar'

// This is sample data
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "DMs",
            url: "#",
            icon: Inbox,
            isActive: true,
        },
        {
            title: "Workspace 1",
            url: "#",
            icon: Box,
            isActive: false,
        },
        {
            title: "Workspace 2",
            url: "#",
            icon: Box,
            isActive: false,
        },
        {
            title: "Workspace 3",
            url: "#",
            icon: Box,
            isActive: false,
        }
    ],
    mails: [
        {
            name: "William Smith",
            email: "williamsmith@example.com",
            date: "09:34 AM",
            teaser:
                "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
        },
        {
            name: "Alice Smith",
            email: "alicesmith@example.com",
            date: "Yesterday",
            teaser:
                "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
        },
        {
            name: "Bob Johnson",
            email: "bobjohnson@example.com",
            date: "2 days ago",
            teaser:
                "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
        },
        {
            name: "Emily Davis",
            email: "emilydavis@example.com",
            date: "2 days ago",
            teaser:
                "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
        },
        {
            name: "Michael Wilson",
            email: "michaelwilson@example.com",
            date: "1 week ago",
            teaser:
                "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
        },
        {
            name: "Sarah Brown",
            email: "sarahbrown@example.com",
            date: "1 week ago",
            teaser:
                "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
        },
        {
            name: "David Lee",
            email: "davidlee@example.com",
            date: "1 week ago",
            teaser:
                "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
        },
        {
            name: "Olivia Wilson",
            email: "oliviawilson@example.com",
            date: "1 week ago",
            teaser:
                "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
        },
        {
            name: "James Martin",
            email: "jamesmartin@example.com",
            date: "1 week ago",
            teaser:
                "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
        },
        {
            name: "Sophia White",
            email: "sophiawhite@example.com",
            date: "1 week ago",
            teaser:
                "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    // Note: I'm using state to show active item.
    // IRL you should use the url/router.
    const [activeItem, setActiveItem] = React.useState(data.navMain[0])
    const [mails, setMails] = React.useState(data.mails)
    const { setOpen } = useSidebar()

    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row pt-[42px]"
            {...props}
        >
            {/* This is the first sidebar */}
            {/* We disable collapsible and adjust width to icon. */}
            {/* This will make the sidebar appear as icons. */}
            <Sidebar
                collapsible="none"
                className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
            >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                                <a href="#">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Command className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">Acme Inc</span>
                                        <span className="truncate text-xs">Enterprise</span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="px-1.5 md:px-0">
                            <SidebarMenu>
                                {data.navMain.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={{
                                                children: item.title,
                                                hidden: false,
                                            }}
                                            onClick={() => {
                                                setActiveItem(item)
                                                const mail = data.mails.sort(() => Math.random() - 0.5)
                                                setMails(
                                                    mail.slice(
                                                        0,
                                                        Math.max(5, Math.floor(Math.random() * 10) + 1)
                                                    )
                                                )
                                                setOpen(true)
                                            }}
                                            isActive={activeItem?.title === item.title}
                                            className="px-2.5 md:px-2"
                                        >
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenuButton>
                        <PlusIcon />
                    </SidebarMenuButton>
                </SidebarFooter>
            </Sidebar>

            {/* This is the second sidebar */}
            {/* We disable collapsible and let it fill remaining space */}
            <Sidebar collapsible="none" className="hidden flex-1 md:flex">
                <SidebarHeader className="gap-3.5 border-b p-4">
                    <div className="flex w-full items-center justify-between">
                        <div className="text-base font-medium text-foreground">
                            {activeItem?.title}
                        </div>
                        <Label className="flex items-center gap-2 text-sm">
                            <span>Unreads</span>
                            <Switch className="shadow-none" />
                        </Label>
                    </div>
                    <SearchForm />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="px-0">
                        <SidebarGroupContent>
                            {mails.map((mail) => (
                                <a
                                    href="#"
                                    key={mail.email}
                                    className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                >
                                    <div className="flex w-full items-center gap-2">
                                        <UserAvatar
                                            user={{
                                                name: mail.name,
                                                full_name: mail.name,
                                                user_image: 'https://github.com/shadcn.png',
                                                type: 'User' as const,
                                                availability_status: '' as const,
                                                custom_status: '',
                                                enabled: 1 as const,
                                                first_name: mail.name.split(' ')[0],
                                            }}
                                            size="xs"
                                            className="size-5 rounded-sm"
                                            showStatusIndicator={false}
                                            showBotIndicator={false}
                                        />
                                        <span className="font-medium">{mail.name}</span>{" "}
                                        <span className="ml-auto text-xs text-muted-foreground">{mail.date}</span>
                                    </div>
                                    <span className="line-clamp-1 w-[280px] whitespace-break-spaces text-xs">
                                        {mail.teaser}
                                    </span>
                                </a>
                            ))}
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </Sidebar>
    )
}
