import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { useColorScheme } from '@hooks/useColorScheme';
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk';
import { revokeAsync } from 'expo-auth-session';
import { useContext } from 'react';
import { clearDefaultSite, deleteAccessToken, getRevocationEndpoint } from '@lib/auth';
import LogOutIcon from '@assets/icons/LogOutIcon.svg';
import { SiteContext } from 'app/[site_id]/_layout';

const LogOutButton = () => {

    const siteInformation = useContext(SiteContext)
    const { tokenParams } = useContext(FrappeContext) as FrappeConfig
    const { colors } = useColorScheme()

    const onLogout = () => {
        // Remove the current site from AsyncStorage
        // Revoke the token
        // Redirect to the landing page
        revokeAsync({
            clientId: siteInformation?.client_id || '',
            token: tokenParams?.token?.() || ''
        }, {
            revocationEndpoint: getRevocationEndpoint(siteInformation?.url || '')
        }).then(result => {
            return deleteAccessToken(siteInformation?.sitename || '')
        }).then((result) => {
            return clearDefaultSite()
        }).then(() => {
            router.replace('/landing')
        }).catch((error) => {
            console.log(error)
        })
    }

    return (
        <Pressable onPress={onLogout}
            className="flex flex-row items-center py-3 px-4 rounded-xl justify-between bg-background dark:bg-card ios:active:bg-red-50">
            <Text className="font-medium text-destructive">Log Out</Text>
            <LogOutIcon height={16} width={16} color={colors.grey} />
        </Pressable>
    )

}

export default LogOutButton