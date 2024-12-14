import { DropdownMenu } from '@radix-ui/themes'
import { BiLogIn } from 'react-icons/bi'
import { WorkspaceFields } from '@/hooks/fetchers/useFetchWorkspaces'
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'

type Props = {
    workspace: WorkspaceFields
}

const JoinWorkspaceButton = ({ workspace }: Props) => {

    const { call } = useFrappePostCall('raven.api.workspaces.join_workspace')

    const { mutate } = useSWRConfig()

    const joinWorkspace = () => {
        toast.promise(call({ workspace: workspace.name }).then(() => {
            mutate('workspaces_list')
            mutate('channel_list')
        }), {
            loading: 'Joining workspace...',
            success: 'You have joined the workspace.',
            error: (error) => `There was an error while joining the workspace.\n${getErrorMessage(error)}`,
        })
    }
    return (
        <DropdownMenu.Item onClick={joinWorkspace}>
            <BiLogIn fontSize={16} />
            Join
        </DropdownMenu.Item>
    )
}

export default JoinWorkspaceButton