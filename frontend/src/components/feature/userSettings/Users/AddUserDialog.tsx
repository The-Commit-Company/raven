import { ErrorText, Label } from "@/components/common/Form"
import { Loader } from "@/components/common/Loader"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { HStack, Stack } from "@/components/layout/Stack"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { UserListContext } from "@/utils/users/UserListProvider"
import { Box, Button, Dialog, Text, TextField } from "@radix-ui/themes"
import { FrappeConfig, FrappeContext, useFrappePostCall } from "frappe-react-sdk"
import { useContext, useState } from "react"
import { useForm } from "react-hook-form"

const AddUserDialog = () => {

    const [open, setOpen] = useState(false)

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <Button>Add User</Button>
            </Dialog.Trigger>
            <Dialog.Content width={'480px'} className={DIALOG_CONTENT_CLASS}>
                <Dialog.Title mb={'1'}>Add User</Dialog.Title>
                <Dialog.Description size={'2'}>Invite a new user to Raven.</Dialog.Description>
                <UserForm onClose={() => setOpen(false)} />
            </Dialog.Content>
        </Dialog.Root>
    )
}

interface UserFormFields {
    email: string,
    first_name: string,
    last_name: string,
}
const UserForm = ({ onClose }: { onClose: VoidFunction }) => {

    const { register, formState: { errors }, getValues, handleSubmit } = useForm<UserFormFields>()

    const [fetching, setFetching] = useState(false)
    const [userExists, setUserExists] = useState(false)
    const [ravenUserExists, setRavenUserExists] = useState(false)

    const { users } = useContext(UserListContext)

    const { call } = useContext(FrappeContext) as FrappeConfig

    const { loading, call: inviteUser, error } = useFrappePostCall('raven.api.raven_users.invite_user')

    const onEmailBlur = () => {
        const email = getValues('email')
        if (!email) {
            setUserExists(false)
            setRavenUserExists(false)
            setFetching(false)
            return
        }

        // Check if Raven User exists
        const user = users.find((user) => user.name === email)
        if (user) {
            setRavenUserExists(true)
        } else {
            setRavenUserExists(false)
            setFetching(true)
            // Check if user exists in Frappe
            call.get('frappe.client.get_value', {
                doctype: 'User',
                filters: [['email', '=', email]],
                fieldname: 'name'
            }).then((user) => {
                setFetching(false)
                if (user.message.name) {
                    setUserExists(true)
                } else {
                    setUserExists(false)
                }
            }).catch((err) => {
                setUserExists(false)
                setFetching(false)
            })
        }
    }

    const onSubmit = (data: UserFormFields) => {
        inviteUser(data)
            .then(() => {
                onClose()
            })
    }


    return <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap='2' pt='2'>
            {error && <ErrorBanner error={error} />}
            <Stack>
                <Box>
                    <Label htmlFor='email' isRequired>Email</Label>
                    <TextField.Root
                        id='email'
                        {...register('email', {
                            required: 'Email is required',
                            onBlur: onEmailBlur
                        })}
                        autoFocus
                        placeholder="email@example.com"
                        aria-invalid={errors.email ? 'true' : 'false'}
                    >
                        {fetching && <TextField.Slot side="right">
                            <Loader />
                        </TextField.Slot>}
                    </TextField.Root>
                </Box>
                {errors.email && <ErrorText>{errors.email?.message}</ErrorText>}
                {ravenUserExists && <ErrorText>This user is already on Raven.</ErrorText>}
            </Stack>
            {!userExists && <>
                <Stack>
                    <Box>
                        <Label htmlFor='first_name' isRequired>First Name</Label>
                        <TextField.Root
                            id='first_name'
                            {...register('first_name', {
                                // Not required if user exists in Frappe
                                required: userExists ? false : 'First Name is required',
                                maxLength: {
                                    value: 140,
                                    message: 'First name must be less than 140 characters',
                                }
                            })}
                        />
                    </Box>
                    {errors.first_name && <ErrorText>{errors.first_name?.message}</ErrorText>}
                </Stack>

                <Stack>
                    <Box>
                        <Label htmlFor='last_name' isRequired>Last Name</Label>
                        <TextField.Root
                            id='last_name'
                            {...register('last_name', {
                                // Not required if user exists in Frappe
                                required: userExists ? false : 'Last Name is required',
                                maxLength: {
                                    value: 140,
                                    message: 'Last name must be less than 140 characters',
                                }
                            })}
                        />
                    </Box>
                    {errors.last_name && <ErrorText>{errors.last_name?.message}</ErrorText>}
                </Stack>
            </>}
            <Text size={'2'} color='gray'>
                {userExists ? 'This user already exists in Frappe. Add them to Raven?' : 'An invite will be sent on their email.'}
            </Text>
            <HStack justify={'end'} pt='4'>
                <Dialog.Close>
                    <Button color='gray' variant={'soft'} disabled={loading}>Cancel</Button>
                </Dialog.Close>
                <Button disabled={ravenUserExists || loading} onClick={handleSubmit(onSubmit)}>
                    {loading ? <Loader className="text-white" /> : null}
                    {userExists ? 'Add' : 'Send Invite'}
                </Button>
            </HStack>
        </Stack>
    </form>
}

export default AddUserDialog