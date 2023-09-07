import { Navigate } from 'react-router-dom'

/**
 * Redirects to the last channel visited by the user
 * If last channel is not found, redirects to general channel
 */
export const ChannelRedirect = () => {

    const lastChannel = localStorage.getItem('ravenLastChannel') ?? 'general'

    return <Navigate to={`/channel/${lastChannel}`} replace />
}