import { router } from 'expo-router';
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk';
import { revokeAsync } from 'expo-auth-session';
import { useContext } from 'react';
import { clearDefaultSite, deleteAccessToken, getRevocationEndpoint } from '@lib/auth';
import { toast } from 'sonner-native';
import { useSetAtom } from 'jotai';
import { selectedWorkspaceFamily } from './useGetCurrentWorkspace';
import useSiteContext from './useSiteContext';


export const useLogout = () => {
    const siteInformation = useSiteContext()
    const { tokenParams } = useContext(FrappeContext) as FrappeConfig

    const setSelectedWorkspace = useSetAtom(selectedWorkspaceFamily(siteInformation?.sitename || ''))

    const logout = () => {
        // Remove the current site from AsyncStorage
        // Revoke the token
        // Redirect to the landing page
        setSelectedWorkspace('')
        clearDefaultSite()
            .then(() => {
                router.replace('/landing')
            })
            .then(() => {
                return deleteAccessToken(siteInformation?.sitename || '')
            })
            .catch((error) => {
                console.error(error)
                toast.error('Failed to log out')
            })
            .then(() => {
                revokeAsync({
                    clientId: siteInformation?.client_id || '',
                    token: tokenParams?.token?.() || ''
                }, {
                    revocationEndpoint: getRevocationEndpoint(siteInformation?.url || '')
                })
            })
    }

    return logout


}