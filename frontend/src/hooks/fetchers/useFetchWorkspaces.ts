import { useFrappeGetCall } from 'frappe-react-sdk'
import { RavenWorkspace } from '@/types/Raven/RavenWorkspace'

export type WorkspaceFields = Pick<RavenWorkspace, 'name' | 'workspace_name' | 'logo' | 'can_only_join_via_invite'>

const useFetchWorkspaces = () => {
    return useFrappeGetCall<{ message: WorkspaceFields[] }>('raven.api.workspaces.get_list')
}

export default useFetchWorkspaces