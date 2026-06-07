import _ from '@lib/translate'
import { cn } from '@lib/utils'
import { BellIcon, HomeIcon, MessageSquareTextIcon, MessagesSquareIcon, SearchIcon } from 'lucide-react'
import { CircleUserRoundIcon } from "lucide-react"
import { NavLink } from 'react-router'

const FOOTER_LINKS = [
    {
        icon: HomeIcon,
        title: _("Home"),
        to: "/",
    },
    {
        icon: MessagesSquareIcon,
        title: _("Direct Messages"),
        to: "/dm-channel",
    },
    {
        icon: MessageSquareTextIcon,
        title: _("Threads"),
        to: "/threads",
    },
    {
        icon: BellIcon,
        title: _("Notifications"),
        to: "/notifications",
    },
    {
        icon: SearchIcon,
        title: _("Search"),
        to: "/search",
    },
    {
        icon: CircleUserRoundIcon,
        title: _("Profile"),
        to: "/profile",
    }
]

const AppMobileFooter = () => {
    return (
        // Add a height to the container to avoid adding padding on every page
        <AppMobileFooterContainer className='h-16'>
            {FOOTER_LINKS.map((link) => (
                <FooterNavLink key={link.to} to={link.to} title={link.title} icon={<link.icon />} />
            ))}
        </AppMobileFooterContainer>
    )
}


export default AppMobileFooter

/** Renders a skeleton where the buttons are not clickable */
export const AppMobileFooterSkeleton = () => {
    return <AppMobileFooterContainer>
        {FOOTER_LINKS.map((link) => (
            <FooterNavLinkSkeleton key={link.to} icon={<link.icon />} title={link.title} />
        ))}
    </AppMobileFooterContainer>
}

const AppMobileFooterContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => {

    return <div className={cn("md:hidden", className)}>
        <div className="grid grid-cols-6 shrink-0 bg-surface-modal border-t border-outline-gray-2 standalone:pb-4 fixed bottom-0 w-screen z-10">
            {children}
        </div></div>
}

const AppMobileFooterButton = ({ icon, title, isActive }: { icon: React.ReactNode, title: string, isActive: boolean }) => {

    return <div data-active={isActive} title={title} className={cn(
        "flex items-center flex-col py-3 justify-center text-ink-gray-4 active:scale-95 data-active:text-ink-gray-9 [&>svg]:size-6 data-active:[&>svg]:text-ink-gray-7"
    )}>
        {icon}
    </div>
}

const FooterNavLink = ({ to, icon, title }: { to: string; icon: React.ReactNode; title: string }) => {
    return (
        <NavLink to={to}>
            {({ isActive }) => (
                <AppMobileFooterButton icon={icon} title={title} isActive={isActive} />
            )}
        </NavLink>
    )
}

const FooterNavLinkSkeleton = ({ title, icon }: { title: string, icon: React.ReactNode }) => {
    return <AppMobileFooterButton icon={icon} title={title} isActive={false} />
}