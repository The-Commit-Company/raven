import { useFrappeGetCall } from 'frappe-react-sdk'
import { RavenWorkspace } from '@/types/Raven/RavenWorkspace'

export type WorkspaceFields = Pick<RavenWorkspace, 'name' | 'workspace_name' | 'logo' | 'type' | 'can_only_join_via_invite' | 'description'> & {
    workspace_member_name?: string
    is_admin?: 0 | 1
}

const useFetchWorkspaces = () => {
    return useFrappeGetCall<{ message: WorkspaceFields[] }>('raven.api.workspaces.get_list', undefined, 'workspaces_list', {
        revalidateOnFocus: false,
        keepPreviousData: true
    })
}

export default useFetchWorkspaces