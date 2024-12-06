import { Avatar, Box, Flex, ScrollArea, Tooltip } from '@radix-ui/themes'
import { HStack, Stack } from '../Stack'
import useFetchWorkspaces, { WorkspaceFields } from '@/hooks/fetchers/useFetchWorkspaces'
import { SidebarFooter } from './SidebarFooter'
import AddWorkspaceSidebarButton from '@/components/feature/workspaces/AddWorkspaceSidebarButton'
import { Link, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { useMemo } from 'react'

const WorkspacesSidebar = () => {

    const { data } = useFetchWorkspaces()

    const myWorkspaces = useMemo(() => {
        return data?.message.filter((workspace) => !!workspace.workspace_member_name) || []
    }, [data])

    return (
        <Stack className='sm:w-18 w-20 sm:p-0 px-2 pb-4 border-r-1 border-gray-4 dark:border-gray-3 h-screen bg-gray-3 dark:bg-gray-1' justify='between'>
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

const WorkspaceItem = ({ workspace }: { workspace: WorkspaceFields }) => {

    const { workspaceID } = useParams()

    const isSelected = workspaceID === workspace.name

    let logo = workspace.logo || ''

    if (!logo && workspace.workspace_name === 'Raven') {
        logo = '/assets/raven/raven-logo.png'
    }
    return <HStack position='relative' align='center' className='group'>
        <Box className={clsx('w-1 h-1.5 bg-gray-12 rounded-r-full dark:bg-gray-12 absolute -left-3 group-hover:h-4 transition-all duration-200 ease-ease-out-cubic',
            isSelected && 'h-[90%] group-hover:h-[90%]'
        )} />
        <Flex align='center' gap='2' width='100%' justify='between' asChild>
            <Tooltip content={workspace.workspace_name} side='right'>
                <Link aria-label={`Switch to ${workspace.workspace_name} workspace`}
                    className={'cursor-pointer'}
                    to={`/${workspace.name}`}
                >
                    <Box>
                        <Avatar
                            size={{ sm: '3', md: '3' }}
                            className={clsx('hover:shadow-sm transition-all duration-200')}
                            color='gray'
                            fallback={workspace.workspace_name.charAt(0)}
                            src={logo}
                        />
                    </Box>
                </Link>
            </Tooltip>
        </Flex></HStack>
}

export default WorkspacesSidebar