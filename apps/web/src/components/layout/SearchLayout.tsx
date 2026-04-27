import { useCallback } from "react"
import { Outlet, useSearchParams } from "react-router-dom"
import { AppLayout } from "@components/layout/AppLayout"
import AppHeader from "@components/features/header/AppHeader"

/**
 * Layout for the global search page (/search).
 * Sidebar-less: only workspace switcher + header with search bar + content.
 * Search is global across all workspaces and DMs.
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

    return (
        <AppLayout
            sidebar={null}
            header={
                <AppHeader
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                />
            }
            sidebarWidth="340px"
        >
            <Outlet context={{ searchValue, setSearchValue }} />
        </AppLayout>
    )
}
