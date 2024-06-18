import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { Accept } from "react-dropzone"
import { useState } from "react"
import { AlertDialog, Box, Dialog, Flex, IconButton, Tooltip } from "@radix-ui/themes"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { DeleteImageModal } from "./DeleteImageModal"
import { useUserData } from "@/hooks/useUserData"
import { toast } from "sonner"
import { CustomFile } from "../../file-upload/FileDrop"
import { UploadImageModal } from "./UploadImageModal"
import { FiCamera } from "react-icons/fi"
import { BiSolidTrash } from "react-icons/bi"
import { UserAvatar, getInitials } from "@/components/common/UserAvatar"

interface ImageUploaderProps {
    /** Takes input MIME type as 'key' & array of extensions as 'value'; empty array - all extensions supported */
    accept?: Accept,
    /** Maximum file size in mb that can be selected */
    maxFileSize?: number,
    icon?: React.ReactNode,
}

export const ImageUploader = ({ icon, accept = { 'image/*': ['.jpeg', '.jpg', '.png'] }, maxFileSize, ...props }: ImageUploaderProps) => {

    const { updateDoc, error: updateDocError } = useFrappeUpdateDoc()
    const userData = useUserData()

    const uploadImage = (file: CustomFile) => {
        if (file) {
            updateDoc('Raven User', userData.name, {
                'user_image': file
            }).then(() => {
                toast("Image uploaded successfully.")
            }).catch(() => {
                toast(`There was an error while uploading the image. ${updateDocError ? updateDocError.exception ?? updateDocError.httpStatusText : null}`)
            })
        }
    }

    const [isUploadImageModalOpen, setUploadImageModalOpen] = useState(false)
    const [isDeleteImageModalOpen, setDeleteImageModalOpen] = useState(false)

    return (
        <Flex direction={'column'} gap='3'>
            <Box className={'relative'}>
                {userData.user_image ? <img src={userData.user_image} alt={'User Image'} className="object-cover h-44 w-44 rounded-xl" />
                    : <UserAvatar alt={userData.full_name} size={'9'} fallback={getInitials(userData.full_name)} className={'h-44 w-44'} />}
                <UploadImage open={isUploadImageModalOpen} setOpen={setUploadImageModalOpen} uploadImage={uploadImage} />
                {userData.user_image && <DeleteImage open={isDeleteImageModalOpen} setOpen={setDeleteImageModalOpen} />}
            </Box>
        </Flex>
    )
}

export const UploadImage = ({ open, setOpen, uploadImage }: { open: boolean, setOpen: (open: boolean) => void, uploadImage: (file: CustomFile) => void }) => {

    const onClose = () => {
        setOpen(false)
    }

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
                <UploadImageModal onClose={onClose} uploadImage={uploadImage} />
            </Dialog.Content>
        </Dialog.Root>
    )
}

export const DeleteImage = ({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) => {

    const onClose = () => {
        setOpen(false)
    }

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <Tooltip content="Remove Image" side="right">
                <AlertDialog.Trigger>
                    <IconButton type='button' aria-label="remove image" size={'1'}
                        className={'absolute -right-2 bottom-6 rounded-md bg-white shadow-md'}>
                        <BiSolidTrash size={'12'} color="tomato" />
                    </IconButton>
                </AlertDialog.Trigger>
            </Tooltip>
            <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
                <DeleteImageModal onClose={onClose} />
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}