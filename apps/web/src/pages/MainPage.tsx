import { AppSidebar } from "@components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@components/ui/sidebar"
import AppHeader from "@components/features/header/AppHeader"
import { Outlet, useLocation } from "react-router-dom"
import React, { useState } from "react"

const MainPage = () => {

    const location = useLocation()
    const isSearchPage = location.pathname === "/search"
    const [searchValue, setSearchValue] = useState("")

    return (
        <div className="flex flex-col h-screen">
            <AppHeader searchValue={isSearchPage ? searchValue : undefined} onSearchChange={isSearchPage ? setSearchValue : undefined} />
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "360px",
                        paddingTop: "var(--app-header-height)",
                    } as React.CSSProperties
                }>
                <AppSidebar />
                <SidebarInset>
                    <Outlet context={{ searchValue, setSearchValue }} />
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}

export default MainPage