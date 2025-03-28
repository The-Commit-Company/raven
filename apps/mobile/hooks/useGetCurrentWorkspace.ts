import { useCallback } from 'react';
import { atomFamily, atomWithStorage, createJSONStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import useSiteContext from './useSiteContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Atom Family for storing selected workspace for multiple sites */
export const selectedWorkspaceFamily = atomFamily((siteID: string) => atomWithStorage<string>(`${siteID}-selected-workspace`, '',
    createJSONStorage(() => AsyncStorage), {
    getOnInit: true
}))

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