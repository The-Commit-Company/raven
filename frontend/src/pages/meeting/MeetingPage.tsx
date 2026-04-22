import { UserListProvider } from '@/utils/users/UserListProvider'
import { Outlet } from 'react-router-dom'

/**
 * Shell component for `/meeting-room/*` routes. Provides the user
 * list context that meeting room subcomponents (participant tiles,
 * chat, etc.) rely on to resolve user IDs to display names + avatars.
 *
 * Mirrors `MeetingPage` from PR #1486 (LiveKit) — kept here so the
 * route layout is consistent across providers.
 */
const MeetingPage = () => {
    return (
        <UserListProvider>
            <Outlet />
        </UserListProvider>
    )
}

export const Component = MeetingPage
