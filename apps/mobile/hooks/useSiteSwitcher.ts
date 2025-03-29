import { useCallback, useMemo, useEffect, useState } from "react"
import { useSheetRef } from "@components/nativewindui/Sheet"
import { SiteInformation } from "types/SiteInformation"
import { getAccessToken, getRevocationEndpoint, setDefaultSite, getSitesFromStorage, getTokenEndpoint, storeAccessToken } from "@lib/auth"
import { revokeAsync, TokenResponse } from "expo-auth-session"
import { router } from "expo-router"

export const useSiteSwitcher = () => {

    const bottomSheetRef = useSheetRef()

    const [sites, setSites] = useState<Record<string, SiteInformation>>({})

    useEffect(() => {
        getSitesFromStorage().then(setSites)
    }, [])

    const [siteInformation, setSiteInformation] = useState<SiteInformation | null>(null)

    const clearSiteInformation = useCallback(() => {
        setSiteInformation(null)
    }, [])

    const hasSites = useMemo(() => Object.keys(sites).length > 0, [sites])

    const presentBottomSheet = useCallback(() => {
        bottomSheetRef.current?.present()
    }, [bottomSheetRef])

    const handleSitePress = useCallback(async (siteName: string) => {

        const siteInfo = sites[siteName]
        setSiteInformation(siteInfo)

        // We need to see if we have an Access Token for this site in SecureStore
        // If yes, we need to check if it's expired
        // If it's expired, try to refresh it
        // If it's not expired, or the refresh succeeds, we need to set the site as the default site
        // If the refresh fails, or the token is not in SecureStore, we need to show the auth flow

        const accessToken = await getAccessToken(siteName)

        if (!accessToken) {
            presentBottomSheet()
            return
        }

        let tokenResponse = new TokenResponse(accessToken)

        if (tokenResponse.shouldRefresh()) {

            const url = siteInfo?.url ?? ''
            tokenResponse.refreshAsync({
                clientId: siteInfo?.client_id || '',
            }, {
                tokenEndpoint: getTokenEndpoint(url),
            }).then(async (tokenResponse) => {
                await storeAccessToken(siteName, tokenResponse)

                // Revoke the old token
                try {
                    await revokeAsync({
                        clientId: siteInfo?.client_id || '',
                        token: accessToken.accessToken,
                    }, {
                        revocationEndpoint: getRevocationEndpoint(url),
                    })
                } catch (error) {
                    // Can ignore this error
                    console.error(error)
                }

                // Set the site as the default site
                setDefaultSite(siteName)

                // Redirect to the site
                router.replace(`/${siteName}`)

            }).catch((error) => {
                console.error(error)

                // Present the bottom sheet to allow the user to try again
                presentBottomSheet()
            })
        } else {
            // Set the site as the default site
            setDefaultSite(siteName)

            // Redirect to the site
            router.replace(`/${siteName}`)
        }

    }, [sites])


    return {
        sites,
        siteInformation,
        presentBottomSheet,
        handleSitePress,
        clearSiteInformation,
        hasSites,
        bottomSheetRef
    }

}