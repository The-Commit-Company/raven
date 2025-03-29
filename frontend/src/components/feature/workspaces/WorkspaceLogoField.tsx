import { useState } from "react"
import { AlertDialog, Box, Button, Dialog, Flex, IconButton, Tooltip } from "@radix-ui/themes"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { FiCamera } from "react-icons/fi"
import { BiSolidTrash } from "react-icons/bi"
import { UserAvatar, getInitials } from "@/components/common/UserAvatar"
import { __ } from "@/utils/translations"
import { useController, useFormContext } from "react-hook-form"
import { RavenWorkspace } from "@/types/Raven/RavenWorkspace"
import { UploadImageModal } from "../userSettings/UploadImage/UploadImageModal"
import { HStack } from "@/components/layout/Stack"

export const WorkspaceLogoField = () => {

    const { control, watch } = useFormContext<RavenWorkspace>()

    const name = watch('name')

    const { field: { value, onChange } } = useController({
        control,
        name: 'logo'
    })

    const [isUploadImageModalOpen, setUploadImageModalOpen] = useState(false)

    const onDelete = () => {
        onChange('')
    }

    const uploadImage = (file: string) => {
        if (file) {
            onChange(file)
        }
        setUploadImageModalOpen(false)
    }

    return (
        <Flex direction={'column'} gap='3'>
            <Box className={'relative'}>
                {value ? <img src={value} alt={'Workspace Logo'} className="object-cover h-32 w-32 rounded-xl" />
                    : <UserAvatar alt={name} size={'9'} fallback={getInitials(name)} className={'h-44 w-44'} />}
                <UploadImage open={isUploadImageModalOpen} setOpen={setUploadImageModalOpen} uploadImage={uploadImage} workspaceID={name} />
                {value && <DeleteImage onDelete={onDelete} />}
            </Box>
        </Flex>
    )
}

export const UploadImage = ({ open, setOpen, uploadImage, workspaceID }: { open: boolean, setOpen: (open: boolean) => void, uploadImage: (file: string) => void, workspaceID: string }) => {

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Tooltip content="Upload Image" side="right">
                <Dialog.Trigger>
                    <IconButton type='button' aria-label="upload image" size={'1'}
                        className={'absolute -right-2 -bottom-1 rounded-md shadow-md'}>
                        <FiCamera size={'12'} />
                    </IconButton>
                </Dialog.Trigger>
            </Tooltip>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <UploadImageModal isPrivate={false} uploadImage={uploadImage} doctype={"Raven Workspace"} docname={workspaceID} fieldname={"logo"} />
            </Dialog.Content>
        </Dialog.Root>
    )
}

export const DeleteImage = ({ onDelete }: { onDelete: () => void }) => {

    return (
        <AlertDialog.Root>
            <Tooltip content="Remove Image" side="right">
                <AlertDialog.Trigger>
                    <IconButton type='button' aria-label="remove image" size={'1'}
                        className={'absolute -right-2 bottom-6 rounded-md bg-white dark:bg-slate-4 shadow-md'}>
                        <BiSolidTrash size={'12'} color="tomato" />
                    </IconButton>
                </AlertDialog.Trigger>
            </Tooltip>
            <AlertDialog.Content className={DIALOG_CONTENT_CLASS} maxWidth="450px">
                <AlertDialog.Title>Remove logo</AlertDialog.Title>
                <AlertDialog.Description size='2'>Are you sure you want to remove the logo?</AlertDialog.Description>
                <HStack gap='2' justify="end" mt='4'>
                    <AlertDialog.Cancel>
                        <Button variant="soft" color="gray">Cancel</Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                        <Button variant="solid" color="red" onClick={onDelete}>Delete</Button>
                    </AlertDialog.Action>
                </HStack>
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}