import { useCallback } from "react"
import { Outlet, useSearchParams } from "react-router-dom"
import AppHeader from "@components/features/header/AppHeader"
import _ from "@lib/translate"
import AppMobileFooter from "@components/features/header/AppMobileFooter"

/**
 * Layout for the global search page (/search).
 *
 * Desktop: workspace-switcher rail + AppHeader + content (sidebar-less AppLayout).
 * Mobile: full-screen page — no rail, no AppHeader (the Search component renders its own
 * mobile top-strip with back button + title + input, similar to channel/DM full-screen pages).
 *
 * Search state lives in URL params so links like /search?q=foo&channel=general work.
 */
export function SearchLayout() {
    const [searchParams, setSearchParams] = useSearchParams()
    const searchValue = searchParams.get('q') ?? ''

    const setSearchValue = useCallback((value: string) => {
        setSearchParams(prev => {
            if (value) {
                prev.set('q', value)
            } else {
                prev.delete('q')
            }
            return prev
        }, { replace: true })
    }, [setSearchParams])

    return <div className="flex flex-col h-screen w-full">
        <AppHeader title={_("Search")} showSearchBar={false} />
        <Outlet context={{ searchValue, setSearchValue }} />
        <AppMobileFooter />
    </div>

}
