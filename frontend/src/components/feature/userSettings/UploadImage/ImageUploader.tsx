import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { Accept } from "react-dropzone"
import { useState } from "react"
import { AlertDialog, Box, Button, Dialog, Flex } from "@radix-ui/themes"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { DeleteImageModal } from "./DeleteImageModal"
import { useUserData } from "@/hooks/useUserData"
import { toast } from "sonner"
import { CustomFile } from "../../file-upload/FileDrop"
import { UploadImageModal } from "./UploadImageModal"
import { BiTrash } from "react-icons/bi"
import { LuUpload } from "react-icons/lu"

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
        <Flex gap='4'>
            <Box>
                {userData.user_image && <ImagePreview file={userData.user_image} />}
            </Box>
            <Flex direction='column' gap='2'>
                <UploadImage open={isUploadImageModalOpen} setOpen={setUploadImageModalOpen} uploadImage={uploadImage} />
                <DeleteImage open={isDeleteImageModalOpen} setOpen={setDeleteImageModalOpen} />
            </Flex>
        </Flex>
    )
}



export interface ImagePreviewProps {
    file: string
}

export const ImagePreview = ({ file }: ImagePreviewProps) => {
    return <img src={file} alt={'User Image'} className={'object-cover rounded-md h-36 w-36'} />
}


export const UploadImage = ({ open, setOpen, uploadImage }: { open: boolean, setOpen: (open: boolean) => void, uploadImage: (file: CustomFile) => void }) => {

    const onClose = () => {
        setOpen(false)
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <Button><LuUpload />Upload</Button>
            </Dialog.Trigger>
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
            <AlertDialog.Trigger>
                <Button color="red" variant="outline">
                    <BiTrash /> Remove
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
                <DeleteImageModal onClose={onClose} />
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}