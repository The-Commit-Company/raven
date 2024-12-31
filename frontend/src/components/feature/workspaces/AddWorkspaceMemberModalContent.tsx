import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { Loader } from '@/components/common/Loader'
import { Box, Button, Dialog, Flex } from '@radix-ui/themes'
import { useCallback, useContext, useMemo } from 'react'
import { UserFields, UserListContext } from '@/utils/users/UserListProvider'
import { ErrorText } from '@/components/common/Form'
import { toast } from 'sonner'
import { useFetchWorkspaceMembers } from './WorkspaceMemberManagement'
import MultipleUserComboBox from '../selectDropdowns/MultipleUserCombobox'

interface AddWorkspaceMemberForm {
    add_members: UserFields[] | null,
}

const AddWorkspaceMembersModalContent = ({ workspaceID, onClose }: { workspaceID: string, onClose: () => void }) => {

    const { mutate } = useSWRConfig()

    const { call, error, loading } = useFrappePostCall('raven.api.workspaces.add_workspace_members')

    const methods = useForm<AddWorkspaceMemberForm>({
        defaultValues: {
            add_members: null
        }
    })

    const { handleSubmit, control } = methods

    const onSubmit = (data: AddWorkspaceMemberForm) => {
        if (data.add_members && data.add_members.length > 0) {
            call({
                workspace: workspaceID,
                members: data.add_members.map((m) => m.name)
            })
                .then(() => {
                    toast.success("Members added")
                    mutate(["workspace_members", workspaceID])
                    onClose()
                })
                .catch((error) => {
                    toast.error(error.message)
                })
        }
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Flex gap='2' direction='column' width='100%'>
                    <ErrorBanner error={error} />
                    <Box width='100%'>
                        <Flex direction='column' gap='2'>
                            <Flex direction='column' gap='2'>
                                <Controller
                                    control={control}
                                    name='add_members'
                                    rules={{
                                        validate: (value) => {
                                            if (value && value.length > 0) {
                                                return true
                                            }
                                            return 'Please select at least one member'
                                        }
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <AddMembersDropdown setSelectedUsers={onChange} selectedUsers={value ?? []} workspaceID={workspaceID} label='' />
                                    )}
                                />
                                <ErrorText>{methods.formState.errors.add_members?.message}</ErrorText>
                            </Flex>
                        </Flex>
                    </Box>
                </Flex>

                <Flex gap="3" mt="6" justify="end" align='center'>
                    <Dialog.Close disabled={loading}>
                        <Button variant="soft" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Button type='button' disabled={loading} onClick={handleSubmit(onSubmit)}>
                        {loading && <Loader className="text-white" />}
                        {loading ? "Saving" : "Save"}
                    </Button>
                </Flex>
            </form>
        </FormProvider>
    )

}

const AddMembersDropdown = ({ workspaceID, selectedUsers, setSelectedUsers, label }: { workspaceID: string, selectedUsers: UserFields[], setSelectedUsers: (users: UserFields[]) => void, label: string }) => {

    const users = useContext(UserListContext)

    const { data } = useFetchWorkspaceMembers(workspaceID)

    //Options for dropdown
    const nonWorkspaceMembers = useMemo(() => {
        const members = data?.message.map((m) => m.user)
        return users.enabledUsers?.filter((m: UserFields) => !members?.includes(m.name)) ?? []
    }, [users.enabledUsers, data])

    /** Function to filter users */
    const getFilteredUsers = useCallback((selectedUsers: UserFields[], inputValue: string) => {
        const lowerCasedInputValue = inputValue.toLowerCase()

        return nonWorkspaceMembers.filter((user: UserFields) => {
            const isUserSelected = selectedUsers.find(selectedUser => selectedUser.name === user.name)
            return (
                !isUserSelected &&
                (user.full_name.toLowerCase().includes(lowerCasedInputValue) ||
                    user.name.toLowerCase().includes(lowerCasedInputValue))
            )
        })
    }, [nonWorkspaceMembers])

    return <MultipleUserComboBox selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} getFilteredUsers={getFilteredUsers} label={label} />
}

export default AddWorkspaceMembersModalContent