import { NavLink } from "react-router-dom"
import { cn } from "@lib/utils"
import { Separator } from "@components/ui/separator"
import { UserCircle, Building2 } from "lucide-react"

interface SettingsGroupProps {
    title: string
    icon?: React.ComponentType<{ size?: number; className?: string }>
    children: React.ReactNode
}

const SettingsGroup = ({ title, icon: Icon, children }: SettingsGroupProps) => {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 py-1.5 text-muted-foreground">
                {Icon && <Icon size={15} />}
                <span className="text-xs">{title}</span>
            </div>
            {children}
        </div>
    )
}

const SettingsSeparator = () => {
    return <Separator className="w-full" />
}

interface SettingsSidebarItemProps {
    title: string
    to: string
    end?: boolean
    standalone?: boolean
    icon?: React.ComponentType<{ size?: number; className?: string }>
}

const SettingsSidebarItem = ({
    title,
    to,
    end,
    standalone = false,
    icon: Icon,
}: SettingsSidebarItemProps) => {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                cn(
                    "no-underline",
                    !standalone && "ml-4"
                )
            }
        >
            {({ isActive }) => (
                <div
                    className={cn(
                        "px-2 py-1 text-[13px] font-medium rounded-md w-full flex items-center transition-colors",
                        isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "bg-transparent hover:bg-sidebar-accent/50 text-sidebar-foreground",
                        standalone && "gap-1.5"
                    )}
                >
                    {Icon && <Icon size={15} className="shrink-0" />}
                    <span>{title}</span>
                </div>
            )}
        </NavLink>
    )
}

export const SettingsSidebar = () => {
    return (
        <div className="h-[calc(100vh-var(--app-header-height))] overflow-y-auto fixed w-64 border-r border-border pt-2 bg-sidebar">
            <div className="flex flex-col gap-2 px-4">
                <SettingsGroup title="My Account" icon={UserCircle}>
                    <SettingsSidebarItem title="Profile" to="profile" />
                    <SettingsSidebarItem title="Appearance" to="appearance" />
                    <SettingsSidebarItem title="Preferences" to="preferences" />
                </SettingsGroup>
                <SettingsGroup title="Workspaces" icon={Building2}>
                    <SettingsSidebarItem title="Workspaces" to="workspaces" />
                </SettingsGroup>
                <SettingsSeparator />
            </div>
        </div>
    )
}

