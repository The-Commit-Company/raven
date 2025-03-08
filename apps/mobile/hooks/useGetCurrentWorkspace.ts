import { useCallback } from 'react';
import { atomFamily, atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import useSiteContext from './useSiteContext';

/** Atom Family for storing selected workspace for multiple sites */
export const selectedWorkspaceFamily = atomFamily((siteID: string) => atomWithStorage<string>(`${siteID}-selected-workspace`, ''))

/**
 * Hook to get the current workspace from async storage
 */

export const useGetCurrentWorkspace = () => {

    const siteInfo = useSiteContext()
    const siteID = siteInfo?.sitename

    const [selectedWorkspace, setSelectedWorkspace] = useAtom(selectedWorkspaceFamily(siteID || ''))

    const switchWorkspace = useCallback(async (workspace: string) => {
        if (siteID) {
            setSelectedWorkspace(workspace)
        }
    }, [siteID])

    return {
        workspace: selectedWorkspace,
        switchWorkspace
    }
}