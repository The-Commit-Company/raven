import { SWRConfiguration, useFrappeGetCall } from 'frappe-react-sdk'
import { RavenWorkspace } from '@raven/types/Raven/RavenWorkspace'

export type WorkspaceFields = Pick<RavenWorkspace, 'name' | 'workspace_name' | 'logo' | 'type' | 'can_only_join_via_invite' | 'description'> & {
    workspace_member_name?: string
    is_admin?: 0 | 1
}

const useFetchWorkspaces = (swrConfig?: SWRConfiguration) => {
    return useFrappeGetCall<{ message: WorkspaceFields[] }>('raven.api.workspaces.get_list', undefined, 'workspaces_list', {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        ...(swrConfig || {})
    })
}

export default useFetchWorkspaces