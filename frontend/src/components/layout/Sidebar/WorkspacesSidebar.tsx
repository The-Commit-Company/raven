import { Avatar, Flex, Link, ScrollArea, Tooltip } from '@radix-ui/themes'
import { Stack } from '../Stack'
import useFetchWorkspaces, { WorkspaceFields } from '@/hooks/fetchers/useFetchWorkspaces'
import { SidebarFooter } from './SidebarFooter'

type Props = {}

const WorkspacesSidebar = (props: Props) => {

    const { data } = useFetchWorkspaces()
    return (
        <Stack className='sm:w-14 w-16 sm:p-0 px-2 pb-4 border-r border-gray-4 dark:border-gray-3 h-screen' justify='between'>
            <ScrollArea className='h-[calc(100vh-7rem)]' type="hover" scrollbars="vertical">
                <Stack align='center' className='px-1 py-2'>
                    {data?.message.map((workspace) => (
                        <WorkspaceItem workspace={workspace} key={workspace.name} />
                    ))}
                </Stack>
            </ScrollArea>
            <Stack>
                <SidebarFooter />
            </Stack>
        </Stack>
    )
}

const WorkspaceItem = ({ workspace }: { workspace: WorkspaceFields }) => {

    let logo = workspace.logo || ''

    if (!logo && workspace.workspace_name === 'Raven') {
        logo = '/assets/raven/raven-logo.png'
    }
    return <Flex align='center' gap='2' width='100%' justify='between' asChild>
        <Tooltip content={workspace.workspace_name} side='right'>
            <Link aria-label={`Switch to ${workspace.workspace_name} workspace`} className='cursor-pointer'>
                <Avatar
                    size={{ sm: '3', md: '2' }}
                    className='hover:shadow-sm transition-all duration-200'
                    color='gray'
                    fallback={workspace.workspace_name.charAt(0)}
                    src={logo}
                />
            </Link>
        </Tooltip>
    </Flex>
}

export default WorkspacesSidebar