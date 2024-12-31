import { DropdownMenu } from '@radix-ui/themes'
import { BiLogOut } from 'react-icons/bi'
import { WorkspaceFields } from '@/hooks/fetchers/useFetchWorkspaces'
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'

type Props = {
    workspace: WorkspaceFields
}

const LeaveWorkspaceButton = ({ workspace }: Props) => {

    const { call } = useFrappePostCall('raven.api.workspaces.leave_workspace')

    const { mutate } = useSWRConfig()

    const leaveWorkspace = () => {
        toast.promise(call({ workspace: workspace.name }).then(() => {
            mutate('workspaces_list')
            mutate('channel_list')
        }), {
            loading: 'Leaving workspace...',
            success: 'You have left the workspace.',
            error: (error) => `There was an error while leaving the workspace.\n${getErrorMessage(error)}`,
        })
    }
    return (
        <DropdownMenu.Item onClick={leaveWorkspace} color='red'>
            <BiLogOut fontSize={16} />
            Leave
        </DropdownMenu.Item>
    )
}

export default LeaveWorkspaceButton