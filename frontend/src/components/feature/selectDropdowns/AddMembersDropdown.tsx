import { useCallback, useContext, useMemo } from 'react'
import { UserFields, UserListContext } from '@/utils/users/UserListProvider'
import MultipleUserComboBox from './MultipleUserCombobox'
import useFetchChannelMembers from '@/hooks/fetchers/useFetchChannelMembers'
import { useFetchWorkspaceMembers } from '../workspaces/WorkspaceMemberManagement'

interface AddMembersDropdownProps {
    channelID: string,
    label?: string,
    selectedUsers: UserFields[],
    setSelectedUsers: (users: UserFields[]) => void,
    workspaceID: string
}

const AddMembersDropdown = ({ channelID, label = 'Select users', selectedUsers, setSelectedUsers, workspaceID }: AddMembersDropdownProps) => {

    const { data: workspaceMembers } = useFetchWorkspaceMembers(workspaceID)

    const { channelMembers } = useFetchChannelMembers(channelID)

    // All users
    const users = useContext(UserListContext)

    //Options for dropdown
    const nonChannelMembers = useMemo(() => {

        // console.log(workspaceMembers)

        // Only workspace members are eligible to be added to the channel
        const eligibleUsers: { [key: string]: string } = {}
        workspaceMembers?.message.forEach((m) => {
            eligibleUsers[m.user] = m.name
        })

        // Filter out users that are already in the channel and are eligible to be added
        return users.enabledUsers?.filter((m: UserFields) => !channelMembers?.[m.name] && eligibleUsers[m.name]) ?? []

    }, [users.enabledUsers, channelMembers, workspaceMembers])

    /** Function to filter users */
    const getFilteredUsers = useCallback((selectedUsers: UserFields[], inputValue: string) => {
        const lowerCasedInputValue = inputValue.toLowerCase()

        return nonChannelMembers.filter((user: UserFields) => {
            const isUserSelected = selectedUsers.find(selectedUser => selectedUser.name === user.name)
            return (
                !isUserSelected &&
                (user.full_name.toLowerCase().includes(lowerCasedInputValue) ||
                    user.name.toLowerCase().includes(lowerCasedInputValue))
            )
        })
    }, [nonChannelMembers])

    return <MultipleUserComboBox selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} getFilteredUsers={getFilteredUsers} label={label} />
}


export default AddMembersDropdown