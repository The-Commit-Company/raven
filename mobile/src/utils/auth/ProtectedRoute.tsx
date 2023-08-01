import { useContext } from 'react'
import { Redirect, Route, RouteProps } from 'react-router-dom'
import { FullPageLoader } from '../../components/layout'
import { Login } from '../../pages/auth'
import { UserContext } from './UserProvider'

export const ProtectedRoute = ({ component, ...props }: RouteProps) => {

    const { currentUser, isLoading } = useContext(UserContext)

    return <Route
        {...props}
        render={(props) => {
            if (isLoading) {
                return <FullPageLoader />
            } else if (!currentUser || currentUser === 'Guest') {
                return <Login />
            }
            {/* @ts-ignore */ }
            return component ? component() : <Redirect to="/" />
        }}

    />
}