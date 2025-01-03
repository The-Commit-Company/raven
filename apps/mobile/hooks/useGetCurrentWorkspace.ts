import { getWorkspaceFromStorage } from '@lib/workspace';
import { SiteContext } from 'app/[site_id]/_layout';
import { useContext, useEffect, useState } from 'react';

export const useGetCurrentWorkspace = () => {

    const siteInfo = useContext(SiteContext)
    const siteID = siteInfo?.sitename

    const [workspace, setWorkspace] = useState<string | null>(null)

    useEffect(() => {
        const fetchWorkspace = async () => {
            if (siteID) {
                const storedWorkspace = await getWorkspaceFromStorage(siteID)
                setWorkspace(storedWorkspace)
            }
        }
        fetchWorkspace()
    }, [siteID])

    return workspace
}