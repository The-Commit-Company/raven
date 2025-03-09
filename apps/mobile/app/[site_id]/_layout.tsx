import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { SiteInformation } from "../../types/SiteInformation";
import { TokenResponse } from "expo-auth-session";
import FullPageLoader from "@components/layout/FullPageLoader";
import { getAccessToken, getSiteFromStorage, getTokenEndpoint, storeAccessToken } from "@lib/auth";
import Providers from "@lib/Providers";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import FrappeNativeProvider from "@lib/FrappeNativeProvider";
import { useNetworkState } from 'expo-network';
import { toast } from "sonner-native";
import { SiteContext } from "@hooks/useSiteContext";

export default function SiteLayout() {

    //  Get the site ID from the route
    const { site_id } = useLocalSearchParams<{ site_id: string }>()

    // If this page is loaded, we need to fetch the site information and the access token
    // On fetching the access token, we need to check if it's valid, and if not, we need to attempt to refresh it.
    // If the refresh fails, we need to redirect the user to the landing page

    const [loading, setLoading] = useState(true)
    const [siteInfo, setSiteInfo] = useState<SiteInformation | null>(null)
    const accessTokenRef = useRef<TokenResponse | null>(null)
    const networkState = useNetworkState();

    // Constants for token refresh timing
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
    const REFRESH_THRESHOLD = REFRESH_INTERVAL + (2 * 60 * 1000); // Check interval + 2 minutes buffer

    // Token refresh interval effect - now only handles periodic checks
    useEffect(() => {

        const shouldRefreshToken = (token: TokenResponse): boolean => {
            if (!token.expiresIn) return false;

            const expirationTime = token.issuedAt + token.expiresIn * 1000; // Convert expiresIn to milliseconds
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;

            console.log('timeUntilExpiry', timeUntilExpiry)

            // Refresh if token will expire within our threshold
            return timeUntilExpiry <= REFRESH_THRESHOLD;
        };

        const refreshTokenIfNeeded = async () => {
            if (!accessTokenRef.current || !siteInfo) return;

            const isOnline = networkState.isConnected && networkState.isInternetReachable;
            if (!isOnline) {
                console.log("Skipping token refresh - device is offline");
                return;
            }

            // Check if token needs refresh based on our proactive threshold
            if (shouldRefreshToken(accessTokenRef.current)) {
                console.log("Proactively refreshing token");
                try {
                    const newToken = await accessTokenRef.current.refreshAsync(
                        {
                            clientId: siteInfo.client_id,
                        },
                        {
                            tokenEndpoint: getTokenEndpoint(siteInfo.url),
                        }
                    );
                    await storeAccessToken(siteInfo.sitename, newToken);
                    accessTokenRef.current = newToken;
                    console.log("Token refreshed successfully");
                } catch (error) {
                    console.error("Token refresh failed:", error);
                    if (isOnline) {
                        toast.error("You have been logged out of the site. Please login again.")
                        router.replace('/landing');
                    }
                }
            }
        };

        const refreshInterval = setInterval(() => {
            const isOnline = networkState.isConnected && networkState.isInternetReachable;
            if (isOnline) {
                refreshTokenIfNeeded();
            }
        }, REFRESH_INTERVAL);

        return () => clearInterval(refreshInterval);
    }, [siteInfo, networkState]);

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

                    // Show the user a toast saying that the site is not found

                    toast.error("The site you are trying to access was not found. Please try logging in again.")

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
                accessTokenRef.current = tokenResponse
            })
            .then(() => {
                setLoading(false)
            })
    }, [site_id])

    // We need to check if the access token is expired or not and keep it refreshed

    const getToken = useCallback(() => {
        return accessTokenRef.current?.accessToken || ''
    }, [])

    return <>
        {loading ? <FullPageLoader /> :
            <SiteContext.Provider value={siteInfo}>
                <FrappeNativeProvider siteInfo={siteInfo} getAccessToken={getToken}>
                    <Providers>
                        <BottomSheetModalProvider>
                            <Stack>
                                <Stack.Screen
                                    name="chat/[id]/create-poll"
                                    options={{
                                        presentation: 'modal',
                                    }}
                                />
                            </Stack>
                        </BottomSheetModalProvider>
                    </Providers>
                </FrappeNativeProvider>
            </SiteContext.Provider>
        }
    </>
}