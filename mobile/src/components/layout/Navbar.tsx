import { IonIcon, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/react"
import { BiBell, BiChat, BiHash, BiSearch, BiUser } from "react-icons/bi"
import { Route } from "react-router-dom"
import { Channels } from "../../pages/channels"
import { DirectMessageList } from "../../pages/direct-messages/DirectMessageList"
import { Notifications } from "../../pages/notifications/Notifications"
import { Profile } from "../../pages/profile"
import { Search } from "../../pages/search/Search"
import { Component, PropsWithChildren, useContext } from "react"
import { UserContext } from "../../utils/auth/UserProvider"
import { FullPageLoader } from "./FullPageLoader"
import { Login } from "../../pages/auth"

export const Navbar = () => {
    const { currentUser, isLoading } = useContext(UserContext)
    return <IonTabs>
        <IonRouterOutlet animated>
            <Route exact path="/:tab(channels)">
                <ProtectedRoute>
                    <Channels />
                </ProtectedRoute>
            </Route>
            <Route exact path="/:tab(direct-messages)">
                <DirectMessageList />
            </Route>
            {/* <Route exact path="/:tab(search)">
                <Search />
            </Route> */}
            {/* <Route exact path="/:tab(notifications)">
                <Notifications />
            </Route> */}
            <Route exact path="/:tab(profile)">
                <ProtectedRoute>
                    <Profile />
                </ProtectedRoute>
            </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom" className="pb-6" hidden={isLoading || !currentUser || currentUser === "Guest"}>
            <IonTabButton tab="channels" href="/channels">
                <BiHash size={30} />
            </IonTabButton>
            <IonTabButton tab="direct-messages" href="/direct-messages">
                <BiChat size={30} />
            </IonTabButton>
            {/* <IonTabButton tab="search" href="/search">
                <BiSearch size={30} />
            </IonTabButton>
            <IonTabButton tab="notifications" href="/notifications">
                <BiBell size={30} />
            </IonTabButton> */}
            <IonTabButton tab="profile" href="/profile">
                <BiUser size={30} />
            </IonTabButton>
        </IonTabBar>
    </IonTabs>
}

const ProtectedRoute = ({ children }: PropsWithChildren) => {
    const { currentUser, isLoading } = useContext(UserContext)

    if (isLoading) {
        return <FullPageLoader />
    }
    if (!currentUser || currentUser === 'Guest') {
        return <Login />
    } else {
        return children
    }
}