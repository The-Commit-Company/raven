import { WorkspaceFields } from '@/hooks/fetchers/useFetchWorkspaces'
import { DropdownMenu, IconButton } from '@radix-ui/themes'
import { BiDotsVerticalRounded } from 'react-icons/bi'
import LeaveWorkspaceButton from './LeaveWorkspaceButton'
import WorkspaceSettingsButton from './WorkspaceSettingsButton'
import JoinWorkspaceButton from './JoinWorkspaceButton'

type Props = {
    workspace: WorkspaceFields
}

const WorkspaceActions = ({ workspace }: Props) => {
    return (
        <div className='flex items-center gap-2 justify-center h-full'>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <IconButton variant='ghost' color='gray' size='3'>
                        <BiDotsVerticalRounded fontSize={16} />
                    </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className='min-w-36'>
                    {workspace.is_admin ? <WorkspaceSettingsButton workspace={workspace} /> : null}
                    {workspace.workspace_member_name ? <LeaveWorkspaceButton workspace={workspace} /> : <JoinWorkspaceButton workspace={workspace} />}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>

    )
}

export default WorkspaceActions