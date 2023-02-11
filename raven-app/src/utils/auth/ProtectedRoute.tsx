import { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { FullPageLoader } from '../../components/layout/Loaders'
import { UserContext } from './UserProvider'

export const ProtectedRoute = () => {

    const { currentUser, isLoading } = useContext(UserContext)

    if (isLoading) {
        return <FullPageLoader />
    }

    else if (!currentUser || currentUser === 'Guest') {
        window.location.replace(`https://${window.location.host}/login?redirect-to=dashboard`);
        return null
    }

    return (
        <Outlet />
    )
}