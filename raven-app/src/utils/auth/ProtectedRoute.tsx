import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { FullPageLoader } from '../../components/layout/Loaders'
import { UserContext } from './UserProvider'

export const ProtectedRoute = () => {

    const { currentUser, isLoading } = useContext(UserContext)

    if (isLoading) {
        return <FullPageLoader />
    }
    else if (!currentUser || currentUser === 'Guest') {
        return <Navigate to="/login" />
    }
    return (
        <Outlet />
    )
}