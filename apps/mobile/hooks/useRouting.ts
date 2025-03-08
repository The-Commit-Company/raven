import { useRouter } from "expo-router";
import useSiteContext from "./useSiteContext";

/**
 * Hook to route to a channel of the current site
 * Can route using either replace or push. Defaults to push
 */
export const useRouteToChannel = () => {

    const siteInfo = useSiteContext()
    const router = useRouter()

    const goToChannel = (channelID: string, method: 'replace' | 'push' = 'push') => {
        if (method === 'replace') {
            router.replace(`/${siteInfo?.sitename}/chat/${channelID}`)
        } else {
            router.push(`/${siteInfo?.sitename}/chat/${channelID}`)
        }
    }

    return goToChannel
}

/**
 * Hook to route to a thread of the current site
 * Can route using either replace or push. Defaults to push
 */
export const useRouteToThread = () => {
    const router = useRouter()
    const siteInfo = useSiteContext()
    const siteID = siteInfo?.sitename

    const goToThread = (threadID: string, method: 'replace' | 'push' = 'push') => {
        if (method === 'replace') {
            router.replace(`/${siteID}/thread/${threadID}`)
        } else {
            router.push(`/${siteID}/thread/${threadID}`)
        }
    }

    return goToThread
}

/**
 * Hook to route to the home page of the current site
 * Can route using either replace or push. Defaults to replace
 */
export const useRouteToHome = () => {
    const router = useRouter()
    const siteInfo = useSiteContext()
    const siteID = siteInfo?.sitename

    const goToHome = (method: 'replace' | 'push' = 'replace') => {
        if (method === 'replace') {
            router.replace(`/${siteID}/home`)
        } else {
            router.push(`/${siteID}/home`)
        }
    }

    return goToHome
}
