import { __ } from '@/utils/translations'
import { Box, Flex, Separator, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { PropsWithChildren, createElement } from 'react';
import { IconType } from 'react-icons'
import { BiBot, BiBuildings, BiHelpCircle } from 'react-icons/bi'
import { BsBoxes } from 'react-icons/bs'
import { FiHelpCircle, FiLifeBuoy } from 'react-icons/fi';
import { LuCircleUserRound } from 'react-icons/lu'
import { NavLink } from 'react-router-dom'

export const SettingsSidebar = () => {
    return (
        <Box className="h-[calc(100vh-57px)] fixed w-64 border-r pt-2 border-gray-4 dark:border-gray-4">
            <Flex direction="column" gap='2' className='px-4'>
                <SettingsGroup title="My Account" icon={LuCircleUserRound}>
                    <SettingsSidebarItem title="Profile" to='profile' />
                    <SettingsSidebarItem title="Appearance" to='appearance' />
                </SettingsGroup>
                <SettingsSeparator />
                <SettingsGroup title="Workspace" icon={BiBuildings}>
                    <SettingsSidebarItem title="Workspaces" to='workspaces' />
                    <SettingsSidebarItem title="Users" to='users' />
                </SettingsGroup>
                <SettingsSeparator />
                <SettingsGroup title='Integrations' icon={BsBoxes}>
                    {/* <SettingsSidebarItem title="ERPNext" to='erpnext' /> */}
                    <SettingsSidebarItem title="HR" to='hr' />
                    {/* <SettingsSidebarItem title='Notifications' to='notifications' /> */}
                    <SettingsSidebarItem title="Message Actions" to='message-actions' />
                    <SettingsSidebarItem title="Scheduled Messages" to='scheduled-messages' />
                    <SettingsSidebarItem title="Webhooks" to='webhooks' />
                    {/* <SettingsSidebarItem title="Frappe LMS" to='frappe-lms' /> */}
                    {/* <SettingsSidebarItem title="Frappe CRM" to='frappe-crm' /> */}
                </SettingsGroup>
                <SettingsSeparator />
                <SettingsGroup title="AI" icon={BiBot}>
                    <SettingsSidebarItem title="Bots" to='bots' />
                    <SettingsSidebarItem title="Functions" to='functions' />
                    <SettingsSidebarItem title="Instructions" to="instructions" />
                    <SettingsSidebarItem title="Commands" to='commands' />
                    <SettingsSidebarItem title="OpenAI Settings" to='openai-settings' />
                </SettingsGroup>
                <SettingsSeparator />
                <SettingsSidebarItem title="Help & Support" to='help' standalone icon={FiLifeBuoy} />
            </Flex>
        </Box>
    )
}

const SettingsGroup = ({ title, icon, children }: PropsWithChildren<{ title: string, icon: IconType }>) => {
    return <Flex direction="column" className='gap-0.5'>
        <SettingsSidebarGroupHeader title={title} icon={icon} />
        {children}
    </Flex>
}

const SettingsSeparator = () => {
    return <Separator className={'w-full'} />
}
const SettingsSidebarGroupHeader = ({ title, icon }: { title: string, icon: IconType }) => {
    return (
        <Flex className="py-1.5 flex items-center gap-1.5 text-gray-11">
            {createElement(icon, { size: 15 })}
            <Text size='1'>{__(title)}</Text>
        </Flex>
    )
}

const SettingsSidebarItem = ({ title, to, end, standalone = false, icon }: { title: string, to: string, end?: boolean, standalone?: boolean, icon?: IconType }) => {

    const activeClass = "bg-slate-3 dark:bg-slate-4 hover:bg-slate-3 hover:dark:bg-slate-4"

    return (
        <NavLink
            to={to}
            end={end}
            className='no-underline'
        >
            {({ isActive }) => {
                return (
                    <Box className={!standalone ? 'ml-4' : ''}>
                        <Flex className={clsx(`px-2 py-1 text-gray-12 rounded-md w-full items-center`, isActive ? activeClass : "bg-transparent hover:bg-slate-2 hover:dark:bg-slate-3", standalone ? "gap-1.5" : '')}>
                            {icon ? createElement(icon, { size: 15 }) : null}
                            <Text className='text-[13px]' weight='medium'>{__(title)}</Text>
                        </Flex>
                    </Box>
                )
            }}
        </NavLink>
    )
}