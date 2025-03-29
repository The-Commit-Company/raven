import { RavenWorkspaceMember } from "@raven/types/Raven/RavenWorkspaceMember"
import { useFrappeGetCall } from "frappe-react-sdk"

type WorkspaceMemberFields = Pick<RavenWorkspaceMember, 'user' | 'is_admin' | 'creation' | 'name'>

export const useFetchWorkspaceMembers = (workspaceID: string) => {
    return useFrappeGetCall<{ message: WorkspaceMemberFields[] }>('raven.api.workspaces.fetch_workspace_members', { workspace: workspaceID }, ["workspace_members", workspaceID], {
        revalidateOnFocus: false,
        errorRetryCount: 2
    })
}