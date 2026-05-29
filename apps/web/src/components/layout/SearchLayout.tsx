import { useCallback } from "react"
import { Outlet, useSearchParams } from "react-router-dom"
import { AppLayout } from "@components/layout/AppLayout"
import AppHeader from "@components/features/header/AppHeader"
import { useIsMobile } from "@hooks/use-mobile"
import _ from "@lib/translate"

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
    const isMobile = useIsMobile()

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

    if (isMobile) {
        return (
            <div className="flex flex-col h-screen overflow-hidden bg-surface-white">
                <Outlet context={{ searchValue, setSearchValue }} />
            </div>
        )
    }

    return (
        <AppLayout
            sidebar={null}
            header={<AppHeader title={_("Search")} />}
            sidebarWidth="340px"
        >
            <Outlet context={{ searchValue, setSearchValue }} />
        </AppLayout>
    )
}
