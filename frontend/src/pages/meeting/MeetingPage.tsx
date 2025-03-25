import { UserListProvider } from '@/utils/users/UserListProvider'
import { Outlet } from 'react-router-dom'

type Props = {}

/**
 * Meeting page is the parent of the meeting room page -provides the user list and LiveKit Token context
 */
const MeetingPage = (props: Props) => {
    return (
        <UserListProvider>
            <Outlet />
        </UserListProvider>
    )
}

export const Component = MeetingPage