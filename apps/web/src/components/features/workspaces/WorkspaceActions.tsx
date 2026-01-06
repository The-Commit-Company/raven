import { WorkspaceFields } from '@hooks/fetchers/useFetchWorkspaces'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import { Button } from '@components/ui/button'
import { EllipsisVertical } from 'lucide-react'
import WorkspaceSettingsButton from '@components/features/workspaces/WorkspaceSettingsButton'
import LeaveWorkspaceButton from '@components/features/workspaces/LeaveWorkspaceButton'
import JoinWorkspaceButton from '@components/features/workspaces/JoinWorkspaceButton'

type Props = {
    workspace: WorkspaceFields
}

const WorkspaceActions = ({ workspace }: Props) => {
    return (
        <div className='flex items-center gap-2 justify-center h-full'>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' color='gray' size='icon'>
                        <EllipsisVertical fontSize={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='min-w-36'>
                    {workspace.is_admin ? <WorkspaceSettingsButton workspace={workspace} /> : null}
                    {workspace.workspace_member_name ? <LeaveWorkspaceButton workspace={workspace} /> : <JoinWorkspaceButton workspace={workspace} />}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

    )
}

export default WorkspaceActions
