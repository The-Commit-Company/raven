import { Label } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { HStack, Stack } from '@/components/layout/Stack'
import { AlertDialog, Box, Button, Dialog, DropdownMenu, IconButton, TextField, VisuallyHidden } from '@radix-ui/themes'
import { useFrappeDeleteDoc, useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { useState } from 'react'
import { AiOutlineEdit } from 'react-icons/ai'
import { BiDotsVerticalRounded, BiTrash } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

type Props = {
    workspaceID: string,
    workspaceName: string,
}

const WorkspaceActionMenu = ({ workspaceID, workspaceName }: Props) => {

    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    return (
        <>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <IconButton type='button' color='gray' variant='soft'>
                        <BiDotsVerticalRounded />
                    </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    <DropdownMenu.Item onClick={() => setIsRenameDialogOpen(true)}>
                        <AiOutlineEdit />
                        Rename
                    </DropdownMenu.Item>
                    <DropdownMenu.Item color='red' onClick={() => setIsDeleteDialogOpen(true)}>
                        <BiTrash />
                        Delete
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            <Dialog.Root open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <Dialog.Content>
                    <RenameWorkspaceDialog onOpenChange={setIsRenameDialogOpen} workspaceID={workspaceID} workspaceName={workspaceName} />
                </Dialog.Content>
            </Dialog.Root>

            <AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialog.Content>
                    <DeleteWorkspaceDialog onOpenChange={setIsDeleteDialogOpen} workspaceID={workspaceID} workspaceName={workspaceName} />
                </AlertDialog.Content>
            </AlertDialog.Root>
        </>
    )
}

export default WorkspaceActionMenu

const RenameWorkspaceDialog = ({ onOpenChange, workspaceID, workspaceName }: { onOpenChange: (open: boolean) => void, workspaceID: string, workspaceName: string }) => {

    const [name, setName] = useState(workspaceName)
    const { mutate: globalMutate } = useSWRConfig()
    const navigate = useNavigate()

    const { call, loading, error } = useFrappePostCall("frappe.model.rename_doc.update_document_title")

    const handleSubmit = () => {
        call({
            doctype: "Raven Workspace",
            docname: workspaceID,
            name: name,
            merge: 0
        })
            .then((res) => {
                toast.success("Workspace renamed")
                globalMutate("workspaces_list")
                onOpenChange(false)
                navigate("../" + res.message, {
                    replace: true
                })
            })
    }
    return (<>
        <Dialog.Title>Rename Workspace</Dialog.Title>
        <VisuallyHidden>
            <Dialog.Description>
                Select a new name for your workspace
            </Dialog.Description>
        </VisuallyHidden>
        <Stack>
            <ErrorBanner error={error} />
            <Box>
                <Label>Select a new name for your workspace</Label>
                <TextField.Root required value={name} onChange={(e) => setName(e.target.value)} />
            </Box>
        </Stack>

        <HStack pt='4' justify='end'>
            <Dialog.Close>
                <Button color='gray' variant='soft' disabled={loading} type='button'>
                    Close
                </Button>
            </Dialog.Close>
            <Button disabled={loading} onClick={handleSubmit} type='button'>
                {loading && <Loader className='text-white' />}
                {loading ? "Renaming..." : "Rename"}
            </Button>
        </HStack>
    </>
    )
}

const DeleteWorkspaceDialog = ({ onOpenChange, workspaceID, workspaceName }: { onOpenChange: (open: boolean) => void, workspaceID: string, workspaceName: string }) => {

    const { mutate: globalMutate } = useSWRConfig()
    const navigate = useNavigate()
    const { deleteDoc, error, loading } = useFrappeDeleteDoc()

    const [typedName, setTypedName] = useState('')

    const isNameTyped = typedName === workspaceName

    const handleDelete = () => {
        if (isNameTyped) {
            deleteDoc("Raven Workspace", workspaceID)
                .then(() => {
                    toast.success("Workspace deleted")
                    onOpenChange(false)
                    globalMutate("workspaces_list")
                    navigate("../", {
                        replace: true
                    })
                })
        }
    }

    return <>
        <AlertDialog.Title>Delete {workspaceName}?</AlertDialog.Title>
        <AlertDialog.Description size='2'>
            Are you sure you want to delete this workspace? If you proceed, all channels, threads and messages within the workspace will be deleted. This action cannot be undone.
        </AlertDialog.Description>
        <Stack pt='2'>
            <ErrorBanner error={error} />
            <Box>
                <Label htmlFor='delete-workspace-name'>Enter the workspace name to confirm deletion</Label>
                <TextField.Root
                    id='delete-workspace-name'
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder={workspaceName}
                />
            </Box>
            <HStack pt='2' justify='end'>
                <AlertDialog.Cancel>
                    <Button color='gray' variant='soft' disabled={loading}>
                        Cancel
                    </Button>
                </AlertDialog.Cancel>
                <Button color='red' disabled={loading || !isNameTyped} onClick={handleDelete}
                >
                    {loading && <Loader className='text-white' />}
                    {loading ? "Deleting..." : "Delete"}
                </Button>
            </HStack>
        </Stack>
    </>
}