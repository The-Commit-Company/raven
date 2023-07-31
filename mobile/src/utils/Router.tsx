import { IonRouterOutlet } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { useContext } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { Login } from '../pages/auth'
import { ViewChannel } from '../pages/channels'
import { AuthContext } from './providers/AuthProvider'
import { Navbar } from '../components/layout/Navbar'

export const AppRouter = () => {

    const { isAuthenticated } = useContext(AuthContext)

    if (isAuthenticated) {
        {/* @ts-ignore */ }
        return <IonReactRouter>
            <IonRouterOutlet animated>
                <Route exact path="/channels" component={Navbar} />
                <Route exact path="/directmessages" component={Navbar} />
                <Route exact path="/search" component={Navbar} />
                <Route exact path="/notifications" component={Navbar} />
                <Route exact path="/profile" component={Navbar} />
                <Route exact path="/">
                    <Redirect to="/channels" />
                </Route>
                <Route exact path="/channel/:channelID" component={ViewChannel} />
            </IonRouterOutlet>
        </IonReactRouter>
    }
    return (
        <Login />
    )
}