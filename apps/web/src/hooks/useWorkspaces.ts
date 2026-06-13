import { useMemo } from 'react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { RavenWorkspace } from '@raven/types/Raven/RavenWorkspace'

export type WorkspaceFields = Pick<RavenWorkspace, 'name' | 'workspace_name' | 'logo' | 'type' | 'can_only_join_via_invite' | 'description'> & {
    workspace_member_name?: string
    is_admin?: 0 | 1
}

/**
 * The stock Raven workspace ships without an uploaded logo — fall back to the
 * bundled mark. Resolving here means `workspace.logo` is display-ready
 * everywhere; no consumer needs a getWorkspaceLogo helper.
 */
const resolveLogo = (workspace: WorkspaceFields): string => {
    if (workspace.logo) return workspace.logo
    if (workspace.workspace_name === 'Raven') return '/assets/raven/raven-logo.png'
    return ''
}

export const useWorkspaces = () => {
    const { data, error, isLoading, mutate } = useFrappeGetCall<{ message: WorkspaceFields[] }>('raven.api.workspaces.get_list', undefined, 'workspaces_list', {
        revalidateOnFocus: false,
        keepPreviousData: true
    })

    // Resolve logos once and keep a stable array reference between fetches
    const workspaces = useMemo(
        () => (data?.message ?? []).map((workspace) => ({ ...workspace, logo: resolveLogo(workspace) })),
        [data?.message]
    )

    return { workspaces, error, isLoading, mutate }
}