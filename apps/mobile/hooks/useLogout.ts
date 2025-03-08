import { router } from 'expo-router';
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk';
import { revokeAsync } from 'expo-auth-session';
import { useContext } from 'react';
import { clearDefaultSite, deleteAccessToken, getRevocationEndpoint } from '@lib/auth';
import { SiteContext } from 'app/[site_id]/_layout';
import { toast } from 'sonner-native';
import { useSetAtom } from 'jotai';
import { selectedWorkspaceFamily } from './useGetCurrentWorkspace';


export const useLogout = () => {
    const siteInformation = useContext(SiteContext)
    const { tokenParams } = useContext(FrappeContext) as FrappeConfig

    const setSelectedWorkspace = useSetAtom(selectedWorkspaceFamily(siteInformation?.sitename || ''))

    const logout = () => {
        // Remove the current site from AsyncStorage
        // Revoke the token
        // Redirect to the landing page
        revokeAsync({
            clientId: siteInformation?.client_id || '',
            token: tokenParams?.token?.() || ''
        }, {
            revocationEndpoint: getRevocationEndpoint(siteInformation?.url || '')
        }).finally(() => {
            return deleteAccessToken(siteInformation?.sitename || '')
        }).then((result) => {
            setSelectedWorkspace('')
            return clearDefaultSite()
        }).then(() => {
            router.replace('/landing')
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to log out')
        })
    }

    return logout


}