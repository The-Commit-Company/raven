import AsyncStorage from "@react-native-async-storage/async-storage"
import { TokenResponse } from "expo-auth-session"
import * as SecureStore from 'expo-secure-store'
import { SiteInformation } from "../types/SiteInformation"

/** 
 * Function to get the access token key for a site
 * 
 * @param siteName - The name of the site
 * @returns The access token key for the site - to be used in SecureStore
 */
export const getAccessTokenKey = (siteName: string) => `${siteName}-access-token`

/** 
 * Key to store all sites in AsyncStorage
 */
export const SITES_KEY = 'sites'

/** 
 * Key to store the default site in AsyncStorage
 */
export const DEFAULT_SITE_KEY = 'default-site'

/** 
 * Discovery object for OAuth2 - Frappe OAuth2 endpoints
 */
export const discovery = {
    authorizationEndpoint: '/api/method/frappe.integrations.oauth2.authorize',
    tokenEndpoint: '/api/method/frappe.integrations.oauth2.get_token',
    revocationEndpoint: '/api/method/frappe.integrations.oauth2.revoke_token',
}

/** 
 * Function to get the authorization endpoint for a site
 * 
 * @param siteURL - The URL of the site
 * @returns The authorization endpoint for the site
 */
export const getAuthorizationEndpoint = (siteURL: string) => `${siteURL}${discovery.authorizationEndpoint}`

/** 
 * Function to get the token endpoint for a site
 * 
 * @param siteURL - The URL of the site
 * @returns The token endpoint for the site
 */
export const getTokenEndpoint = (siteURL: string) => `${siteURL}${discovery.tokenEndpoint}`

/** 
 * Function to get the revocation endpoint for a site
 * 
 * @param siteURL - The URL of the site
 * @returns The revocation endpoint for the site
 */
export const getRevocationEndpoint = (siteURL: string) => `${siteURL}${discovery.revocationEndpoint}`

/** 
 * Function to store the access token for a site in SecureStore
 * 
 * @param siteName - The name of the site
 * @param token - The access token
 */
export const storeAccessToken = (siteName: string, token: TokenResponse) => {
    const tokenWithoutIDToken = { ...token, idToken: undefined }
    return SecureStore.setItemAsync(getAccessTokenKey(siteName), JSON.stringify(tokenWithoutIDToken))
}

/** 
 * Function to delete the access token for a site from SecureStore
 * 
 * @param siteName - The name of the site
 */
export const deleteAccessToken = (siteName: string) => {
    return SecureStore.deleteItemAsync(getAccessTokenKey(siteName))
}

/** 
 * Function to get the access token for a site from SecureStore
 * 
 * @param siteName - The name of the site
 * @returns The access token for the site
 */
export const getAccessToken = async (siteName: string): Promise<TokenResponse | null> => {
    return SecureStore.getItemAsync(getAccessTokenKey(siteName)).then((token) => {
        return token ? JSON.parse(token) : null
    })
}

/** 
 * Function to get all sites from AsyncStorage
 * 
 * @returns All sites from AsyncStorage
 */
export const getSitesFromStorage = async (): Promise<Record<string, SiteInformation>> => {
    return AsyncStorage.getItem(SITES_KEY).then((sites) => {
        const sitesObj = JSON.parse(sites || '{}')
        return sitesObj
    })
}

/** 
 * Function to get a site from AsyncStorage
 * 
 * @param siteName - The name of the site
 * @returns The site from AsyncStorage
 */
export const getSiteFromStorage = async (siteName: string): Promise<SiteInformation | null> => {
    return AsyncStorage.getItem(SITES_KEY).then((sites) => {
        const sitesObj = JSON.parse(sites || '{}')
        return sitesObj[siteName] || null
    })
}

/** 
 * Function to add a site to AsyncStorage
 * 
 * @param siteName - The name of the site
 * @param siteInfo - The site information
 */
export const addSiteToStorage = async (siteName: string, siteInfo: SiteInformation) => {
    return AsyncStorage.mergeItem(SITES_KEY, JSON.stringify({ [siteName]: siteInfo }))
}

/** 
 * Function to remove a site from AsyncStorage
 * 
 * @param siteName - The name of the site
 */
export const removeSiteFromStorage = async (siteName: string) => {
    return AsyncStorage.getItem(SITES_KEY).then((sites) => {
        const sitesObj = JSON.parse(sites || '{}')
        delete sitesObj[siteName]
    }).then((sitesObj) => {
        return AsyncStorage.setItem(SITES_KEY, JSON.stringify(sitesObj))
    })
}

/** 
 * Function to set the default site in AsyncStorage
 * 
 * @param siteName - The name of the site
 */
export const setDefaultSite = (siteName: string) => {
    return AsyncStorage.setItem(DEFAULT_SITE_KEY, siteName)
}

/** 
 * Function to clear the default site from AsyncStorage
 */
export const clearDefaultSite = () => {
    return AsyncStorage.removeItem(DEFAULT_SITE_KEY)
}


/** 
 * Function to get the default site from AsyncStorage
 * 
 * @returns The default site from AsyncStorage
 */
export const getDefaultSite = async (): Promise<string | null> => {
    return AsyncStorage.getItem(DEFAULT_SITE_KEY)
}