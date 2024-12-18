import { Text } from "@components/nativewindui/Text";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SiteInformation } from "../../types/SiteInformation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from 'expo-secure-store';
import { TokenResponse } from "expo-auth-session";
import { FrappeProvider } from "frappe-react-sdk";

export default function SiteLayout() {

    //  Get the site ID from the route
    const { site_id } = useLocalSearchParams<{ site_id: string }>()

    // If this page is loaded, we need to fetch the site information and the access token
    // On fetching the access token, we need to check if it's valid, and if not, we need to attempt to refresh it.
    // If the refresh fails, we need to redirect the user to the landing page

    const [loading, setLoading] = useState(true)
    const [siteInfo, setSiteInfo] = useState<SiteInformation | null>(null)
    const [accessToken, setAccessToken] = useState<TokenResponse | null>(null)


    useEffect(() => {

        let site_info: SiteInformation | null = null

        AsyncStorage.getItem('sites')
            .then(sites => {
                if (!sites) {
                    router.replace('/landing')

                    // TODO: Show the user a toast saying that the site is not found

                    return null
                }

                const parsedSites: { [key: string]: SiteInformation } = JSON.parse(sites)
                const siteInfo = parsedSites[site_id]

                if (!siteInfo) {
                    router.replace('/landing')

                    // TODO: Show the user a toast saying that the site is not found

                    return null
                }

                setSiteInfo(siteInfo)
                site_info = siteInfo

                return siteInfo
            })
            .then((siteInfo: SiteInformation | null) => {
                if (!siteInfo) return null

                return SecureStore.getItemAsync(`${site_id}-access-token`)
            })
            .then(accessToken => {
                if (!accessToken) {
                    router.replace('/landing')

                    // TODO: Show the user a toast saying that the site is not found

                    return null
                }
                const tokenConfig: TokenResponse = JSON.parse(accessToken)

                let tokenResponse = new TokenResponse(tokenConfig)

                if (tokenResponse.shouldRefresh()) {
                    console.log("Refreshing token")
                    return tokenResponse.refreshAsync({
                        clientId: site_info?.client_id || '',
                    }, {
                        tokenEndpoint: site_info?.url + '/api/method/frappe.integrations.oauth2.get_token',
                    })
                } else {
                    return tokenResponse
                }
            })
            .then(tokenResponse => {
                if (!tokenResponse) return

                setAccessToken(tokenResponse)
            })
            .then(() => {
                setLoading(false)
            })
    }, [site_id])

    return <>
        <Stack.Screen options={{ headerShown: false }} />
        {loading ? <View className="flex-1 justify-center items-center gap-2">

            {/* TODO: Change this UI */}
            <Text className="text-4xl font-bold">raven</Text>
            <Text>Setting up your workspace...</Text>
        </View> :
            <FrappeProvider
                url={siteInfo?.url}
                tokenParams={{
                    type: 'Bearer',
                    useToken: true,
                    token: () => accessToken?.accessToken || '',
                }}
                siteName={siteInfo?.sitename}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
            </FrappeProvider>
        }
    </>
}