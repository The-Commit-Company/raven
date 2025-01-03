import { addWorkspaceToStorage, getWorkspaceFromStorage } from '@lib/workspace';
import useFetchWorkspaces from '@raven/lib/hooks/useFetchWorkspaces';
import { SiteContext } from 'app/[site_id]/_layout';
import { useContext, useEffect, useState } from 'react';

/**
 * Hook to get the current workspace from async storage
 * @returns {string | null} The current workspace
 */
export const useGetCurrentWorkspace = () => {

    const siteInfo = useContext(SiteContext)
    const siteID = siteInfo?.sitename

    const [workspace, setWorkspace] = useState<string | null>(null)

    // Fetch workspaces
    const { data: workspaces } = useFetchWorkspaces()

    useEffect(() => {
        const fetchWorkspace = async () => {
            if (siteID) {
                const storedWorkspace = await getWorkspaceFromStorage(siteID)
                setWorkspace(storedWorkspace)

                if (!storedWorkspace) {
                    const firstWorkspace = workspaces?.message[0]
                    if (firstWorkspace) {
                        await addWorkspaceToStorage(siteID, firstWorkspace.name)
                        setWorkspace(firstWorkspace.name)
                    }
                }
            }
        }
        fetchWorkspace()
    }, [siteID])

    return workspace
}