import { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FullPageLoader } from '../../components/layout/Loaders';
import { UserContext } from './UserProvider';

export const ProtectedRoute = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, isLoading } = useContext(UserContext);

    // State to manage if the page has been reloaded
    const [reloaded, setReloaded] = useState(false);

    // Effect to handle the reload based on 'sid' presence in the URL
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const sid = searchParams.get('sid');

        // Check if 'sid' is present and the page has not been reloaded yet
        if (sid && !reloaded) {
            setReloaded(true); // Set to true to prevent future reloads
            navigate(location.pathname, { replace: true }); // Reload the page using only pathname
        }
    }, [location, navigate, reloaded]);

    // Handle loading state
    if (isLoading) {
        return <FullPageLoader />;
    }

    // Redirect if user is not authenticated or is a 'Guest'
    if (!currentUser || currentUser === 'Guest') {
        return <Navigate to="/login" />;
    }

    // Render the outlet if all checks pass
    return <Outlet />;
};