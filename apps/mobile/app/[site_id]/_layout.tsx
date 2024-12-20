import { router, Stack, useLocalSearchParams } from "expo-router";
import { createContext, useEffect, useState } from "react";
import { SiteInformation } from "../../types/SiteInformation";
import { TokenResponse } from "expo-auth-session";
import { FrappeProvider } from "frappe-react-sdk";
import FullPageLoader from "@components/layout/FullPageLoader";
import { getAccessToken, getSiteFromStorage, getTokenEndpoint, storeAccessToken } from "@lib/auth";

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

        getSiteFromStorage(site_id)
            .then(siteInfo => {
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

                return getAccessToken(siteInfo.sitename)
            })
            .then(accessToken => {
                if (!accessToken) {
                    router.replace('/landing')

                    // TODO: Show the user a toast saying that the site is not found

                    return null
                }

                let tokenResponse = new TokenResponse(accessToken)

                if (tokenResponse.shouldRefresh()) {
                    console.log("Refreshing token")
                    return tokenResponse.refreshAsync({
                        clientId: site_info?.client_id || '',
                    }, {
                        tokenEndpoint: getTokenEndpoint(site_info?.url || ''),
                    }).then(async (tokenResponse) => {
                        await storeAccessToken(site_info?.sitename || '', tokenResponse)
                        return tokenResponse
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
        {loading ? <FullPageLoader /> :
            <SiteContext.Provider value={siteInfo}>
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
            </SiteContext.Provider>
        }
    </>
}

export const SiteContext = createContext<SiteInformation | null>(null)