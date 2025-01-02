import { useCallback, useContext, useMemo } from 'react'
import { UserFields, UserListContext } from '@/utils/users/UserListProvider'
import MultipleUserComboBox from './MultipleUserCombobox'
import useFetchChannelMembers from '@/hooks/fetchers/useFetchChannelMembers'

interface AddMembersDropdownProps {
    channelID: string,
    label?: string,
    selectedUsers: UserFields[],
    setSelectedUsers: (users: UserFields[]) => void
}

const AddMembersDropdown = ({ channelID, label = 'Select users', selectedUsers, setSelectedUsers }: AddMembersDropdownProps) => {

    const { channelMembers } = useFetchChannelMembers(channelID)

    // All users
    const users = useContext(UserListContext)

    //Options for dropdown
    const nonChannelMembers = useMemo(() => users.enabledUsers?.filter((m: UserFields) => !channelMembers?.[m.name]) ?? [], [users.enabledUsers, channelMembers])

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