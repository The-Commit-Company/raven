import { useState } from "react"
import { Outlet } from "react-router-dom"
import { AppLayout } from "@components/layout/AppLayout"
import AppHeader from "@components/features/header/AppHeader"

/**
 * Layout for the global search page (/search).
 * Sidebar-less: only workspace switcher + header with search bar + content.
 * Search is global across all workspaces and DMs.
 */
export function SearchLayout() {
    const [searchValue, setSearchValue] = useState("")

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
