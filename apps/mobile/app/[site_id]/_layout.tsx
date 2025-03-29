import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { SiteInformation } from "../../types/SiteInformation";
import { revokeAsync, TokenResponse } from "expo-auth-session";
import FullPageLoader from "@components/layout/FullPageLoader";
import { addSiteToStorage, clearDefaultSite, getAccessToken, getRevocationEndpoint, getSiteFromStorage, getTokenEndpoint, storeAccessToken } from "@lib/auth";
import Providers from "@lib/Providers";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import FrappeNativeProvider from "@lib/FrappeNativeProvider";
import { addNetworkStateListener, useNetworkState } from 'expo-network';
import { toast } from "sonner-native";
import { SiteContext } from "@hooks/useSiteContext";
import { AppState } from "react-native";
import OfflineBanner from "@components/features/auth/OfflineBanner";

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

    // We need to check if the access token is expired or not and keep it refreshed
    // Token refresh interval effect - now only handles periodic checks
    useEffect(() => {

        const shouldRefreshToken = (token: TokenResponse): boolean => {
            if (!token.expiresIn) return false;

            const expirationTime = (token.issuedAt + token.expiresIn) * 1000; // Convert expiresIn to milliseconds
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;

            // Refresh if token will expire within our threshold
            return timeUntilExpiry <= REFRESH_THRESHOLD;
        };

        const isTokenExpired = (token: TokenResponse): boolean => {
            if (!token.expiresIn) return false;

            const expirationTime = (token.issuedAt + token.expiresIn) * 1000; // Convert expiresIn to milliseconds
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;

            return timeUntilExpiry <= 0;
        }

        const refreshTokenIfNeeded = async () => {
            if (!accessTokenRef.current || !siteInfo) return;

            const isOnline = networkState.isConnected && networkState.isInternetReachable;
            if (!isOnline) {
                console.log("Skipping token refresh - device is offline");
                return;
            }

            if (isTokenExpired(accessTokenRef.current)) {
                setLoading(true)
            }

            // Check if token needs refresh based on our proactive threshold
            if (shouldRefreshToken(accessTokenRef.current)) {
                console.log("Proactively refreshing token");
                try {

                    const oldToken = `${accessTokenRef.current.accessToken}`
                    const newToken = await accessTokenRef.current.refreshAsync(
                        {
                            clientId: siteInfo.client_id,
                        },
                        {
                            tokenEndpoint: getTokenEndpoint(siteInfo.url),
                        }
                    );
                    await storeAccessToken(siteInfo.sitename, newToken);

                    // Store the new token in the ref before revoking the old token since some API calls might be in-flight
                    accessTokenRef.current = newToken;

                    setLoading(false)

                    console.log("Token refreshed successfully");
                    // Now we need to revoke the old token
                    try {
                        await revokeAsync({
                            clientId: siteInfo.client_id,
                            token: oldToken,
                        }, {
                            revocationEndpoint: getRevocationEndpoint(siteInfo.url),
                        })
                    } catch (error) {
                        // Can ignore this error since it's not a big deal if it fails
                        console.error("Error revoking old token:", error);
                    }

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

        // If the application is in the background and then the user comes back, we need to check if the token is expired
        // If it is, we need to refresh it. We also need to do the same for network state changes

        const focusSubscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                console.log("App in focus")
                refreshTokenIfNeeded()
            }
        })

        // Add a listener for the network state
        const networkSubscription = addNetworkStateListener((state) => {
            if (state.isConnected && state.isInternetReachable) {
                refreshTokenIfNeeded()
            }
        })

        return () => {
            clearInterval(refreshInterval)
            focusSubscription.remove()
            networkSubscription.remove()
        }
    }, [siteInfo, networkState]);

    useEffect(() => {

        let site_info: SiteInformation | null = null

        getSiteFromStorage(site_id)
            .then(siteInfo => {
                if (!siteInfo) {
                    router.replace('/landing')

                    // Show the user a toast saying that the site is not found
                    clearDefaultSite()
                    toast.error("We could not find the site you were looking for. Please login again.")

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
                    clearDefaultSite()

                    toast.error("We could not find the stored credentials for this site. Please try logging in again.")

                    return null
                }

                let tokenResponse = new TokenResponse(accessToken)

                if (tokenResponse.shouldRefresh()) {

                    const oldToken = `${tokenResponse.accessToken}`

                    console.log("Refreshing token")
                    return tokenResponse.refreshAsync({
                        clientId: site_info?.client_id || '',
                    }, {
                        tokenEndpoint: getTokenEndpoint(site_info?.url || ''),
                    }).then(async (tokenResponse) => {
                        await storeAccessToken(site_info?.sitename || '', tokenResponse)

                        // Revoke the old token
                        try {
                            await revokeAsync({
                                clientId: site_info?.client_id || '',
                                token: oldToken,
                            }, {
                                revocationEndpoint: getRevocationEndpoint(site_info?.url || ''),
                            })
                        } catch (error) {
                            console.error("Error revoking old token:", error);
                        }

                        return tokenResponse
                    }).catch(error => {
                        console.error("Error refreshing token:", error);
                        return null
                    })
                } else {
                    return tokenResponse
                }
            })
            .then(tokenResponse => {
                if (!tokenResponse) {
                    router.replace('/landing')

                    // Show the user a toast saying that the site is not found
                    clearDefaultSite()

                    toast.error("We could not find the stored credentials for this site. Please try logging in again.")

                    return
                }
                accessTokenRef.current = tokenResponse
            })
            .then(() => {
                setLoading(false)
            })
    }, [site_id])

    const getToken = useCallback(() => {
        return accessTokenRef.current?.accessToken || ''
    }, [])

    const siteInfoRefreshedRef = useRef(false)


    useEffect(() => {
        // Fetch latest site information from the server
        // This is not a priority, so we can do it on the background
        if (!siteInfo || !site_id || siteInfoRefreshedRef.current) return

        fetch(`${siteInfo.url}/api/method/raven.api.raven_mobile.get_client_id`)
            .then(res => res.json())
            .then(data => {
                if (data.message && data.message.client_id) {
                    setSiteInfo({
                        ...siteInfo,
                        ...data.message
                    })

                    addSiteToStorage(site_id, {
                        ...siteInfo,
                        ...data.message
                    })
                    siteInfoRefreshedRef.current = true
                }
            })

    }, [siteInfo, site_id])

    const isOffline = !networkState.isConnected || !networkState.isInternetReachable

    return <>
        {loading ? <FullPageLoader /> :
            <SiteContext.Provider value={siteInfo}>
                {isOffline ? <OfflineBanner /> : null}
                <FrappeNativeProvider siteInfo={siteInfo} getAccessToken={getToken}>
                    <Providers>
                        <BottomSheetModalProvider>
                            <Stack initialRouteName="(tabs)">
                                <Stack.Screen
                                    name="chat/[id]/create-poll"
                                    options={{
                                        presentation: 'modal',
                                    }}
                                />
                                <Stack.Screen
                                    name="thread/[id]/create-poll"
                                    options={{
                                        presentation: 'modal',
                                    }}
                                />
                                <Stack.Screen
                                    name="chat/[id]/pinned-messages"
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