import { Avatar, Box, Flex, ScrollArea, Text, Tooltip } from '@radix-ui/themes'
import { HStack, Stack } from '../Stack'
import useFetchWorkspaces, { WorkspaceFields } from '@/hooks/fetchers/useFetchWorkspaces'
import { SidebarFooter } from './SidebarFooter'
import AddWorkspaceSidebarButton from '@/components/feature/workspaces/AddWorkspaceSidebarButton'
import { Link, useLocation, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { useContext, useMemo } from 'react'
import useUnreadMessageCount from '@/hooks/useUnreadMessageCount'
import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'
import { generateAvatarColor } from '@/components/feature/selectDropdowns/GenerateAvatarColor'
import { getInitials } from '@/components/common/UserAvatar'

const WorkspacesSidebar = () => {

    const { data } = useFetchWorkspaces()

    const { unread_count } = useUnreadMessageCount()
    const { channels } = useContext(ChannelListContext) as ChannelListContextType

    const myWorkspaces: (WorkspaceFields & { unread_count: number })[] = useMemo(() => {
        const myWorkspaces: WorkspaceFields[] = data?.message.filter((workspace) => !!workspace.workspace_member_name) || []
        // Add unread counts to each workspace
        const workspace_unread_counts: Record<string, number> = {}

        // Loop over all channels in the channels context and find it's unread count and add it to the workspace_unread_counts object
        channels.forEach((channel) => {
            if (channel.workspace) {
                let unreadCounts = unread_count?.message?.find((c) => c.name === channel.name)?.unread_count || 0
                workspace_unread_counts[channel.workspace] = (workspace_unread_counts?.[channel.workspace] || 0) + unreadCounts
            }
        })

        const myWorkspacesWithUnreadCounts = myWorkspaces.map((workspace) => {
            return {
                ...workspace,
                unread_count: workspace_unread_counts[workspace.name] || 0
            }
        })

        return myWorkspacesWithUnreadCounts
    }, [data, channels, unread_count])

    return (
        <Stack className='w-20 p-0 pb-4 border-r border-gray-4 dark:border-gray-6 h-screen' justify='between'>
            <ScrollArea className='h-[calc(100vh-7rem)]' type="hover" scrollbars="vertical">
                <Stack align='center' className='px-1 py-2' gap='3'>
                    {myWorkspaces.map((workspace) => (
                        <WorkspaceItem workspace={workspace} key={workspace.name} />
                    ))}
                    <AddWorkspaceSidebarButton />
                </Stack>
            </ScrollArea>
            <Stack>
                <SidebarFooter />
            </Stack>
        </Stack>
    )
}

const WorkspaceItem = ({ workspace }: { workspace: WorkspaceFields & { unread_count: number } }) => {

    const { workspaceID } = useParams()

    const isSelected = workspaceID === workspace.name

    let logo = workspace.logo || ''

    if (!logo && workspace.workspace_name === 'Raven') {
        logo = '/assets/raven/raven-logo.png'
    }

    const location = useLocation()

    const path = isSelected ? location.pathname : `/${workspace.name}`

    const openWorkspace = () => {
        localStorage.setItem('ravenLastWorkspace', workspace.name)
        localStorage.removeItem('ravenLastChannel')
    }

    return <HStack position='relative' align='center' className='group'>
        <Box className={clsx('w-1.5 bg-gray-12 rounded-r-full dark:bg-gray-12 absolute sm:-left-3 -left-3.5 group-hover:h-4 transition-all duration-200 ease-ease-out-cubic',
            isSelected ? 'h-[90%] group-hover:h-[90%] group-active:h-[90%]' : 'group-active:h-4',
            workspace.unread_count > 0 && 'h-1.5'
        )} />
        <Flex align='center' gap='2' width='100%' justify='between' asChild>
            <Tooltip content={workspace.workspace_name} side='right'>
                <Link aria-label={`Switch to ${workspace.workspace_name} workspace`}
                    className={'cursor-pointer'}
                    to={path}
                    onClick={openWorkspace}
                >
                    <WorkspaceLogo workspace_name={workspace.workspace_name} logo={logo} />
                </Link>
            </Tooltip>
        </Flex>
        {workspace.unread_count > 0 &&
            <Box className='rounded-full absolute -right-2 -bottom-1 bg-red-11 dark:bg-red-9 text-white w-4 h-4 flex items-center justify-center'>
                <Text as='span' size='1' weight='medium'>{workspace.unread_count}</Text>
            </Box>
        }
    </HStack>
}

const WorkspaceLogo = ({ workspace_name, logo }: { workspace_name: string, logo: string }) => {

    const { color, fallback } = useMemo(() => {
        const fallback = getInitials(workspace_name)
        const color = generateAvatarColor(workspace_name)

        return {
            color,
            fallback
        }
    }, [workspace_name])
    return <Box>
        <Avatar
            size={{ sm: '3', md: '3' }}
            className={clsx('hover:shadow-sm transition-all duration-200')}
            color={color}
            loading='eager'
            fallback={fallback}
            src={logo}
        />
    </Box>
}

export default WorkspacesSidebar