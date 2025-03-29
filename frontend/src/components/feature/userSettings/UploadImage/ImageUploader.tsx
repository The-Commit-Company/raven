import { useFrappePostCall } from "frappe-react-sdk"
import { Accept } from "react-dropzone"
import { useState } from "react"
import { AlertDialog, Box, Dialog, Flex, IconButton, Tooltip } from "@radix-ui/themes"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { DeleteImageModal } from "./DeleteImageModal"
import { toast } from "sonner"
import { UploadImageModal } from "./UploadImageModal"
import { FiCamera } from "react-icons/fi"
import { BiSolidTrash } from "react-icons/bi"
import { UserAvatar, getInitials } from "@/components/common/UserAvatar"
import useCurrentRavenUser from "@/hooks/useCurrentRavenUser"
import { __ } from "@/utils/translations"
import { getErrorMessage } from "@/components/layout/AlertBanner/ErrorBanner"

interface ImageUploaderProps {
    /** Takes input MIME type as 'key' & array of extensions as 'value'; empty array - all extensions supported */
    accept?: Accept,
    /** Maximum file size in mb that can be selected */
    maxFileSize?: number,
    icon?: React.ReactNode,
}

export const ImageUploader = ({ icon, accept = { 'image/*': ['.jpeg', '.jpg', '.png'] }, maxFileSize, ...props }: ImageUploaderProps) => {

    const { call } = useFrappePostCall('raven.api.raven_users.update_raven_user')
    const { myProfile, mutate } = useCurrentRavenUser()

    const [isUploadImageModalOpen, setUploadImageModalOpen] = useState(false)
    const [isDeleteImageModalOpen, setDeleteImageModalOpen] = useState(false)

    const uploadImage = (file: string) => {
        if (file) {
            call({
                user_image: file
            }).then(() => {
                toast(__("Image uploaded successfully."))
                mutate()
                setUploadImageModalOpen(false)
            }).catch((error) => {
                toast(`There was an error while uploading the image.`, {
                    description: getErrorMessage(error)
                })
            })
        }
    }



    return (
        <Flex direction={'column'} gap='3'>
            <Box className={'relative'}>
                {myProfile?.user_image ? <img src={myProfile?.user_image} alt={'User Image'} className="object-cover h-44 w-44 rounded-xl" />
                    : <UserAvatar alt={myProfile?.full_name} size={'9'} fallback={getInitials(myProfile?.full_name)} className={'h-44 w-44'} />}
                <UploadImage open={isUploadImageModalOpen} setOpen={setUploadImageModalOpen} uploadImage={uploadImage} userID={myProfile?.name ?? ''} />
                {myProfile?.user_image && <DeleteImage open={isDeleteImageModalOpen} setOpen={setDeleteImageModalOpen} />}
            </Box>
        </Flex>
    )
}

export const UploadImage = ({ open, setOpen, uploadImage, userID }: { open: boolean, setOpen: (open: boolean) => void, uploadImage: (file: string) => void, userID: string }) => {

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
                <UploadImageModal isPrivate={false} uploadImage={uploadImage} doctype={"Raven User"} docname={userID} fieldname={"user_image"} />
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
                        className={'absolute -right-2 bottom-6 rounded-md bg-white dark:bg-slate-4 shadow-md'}>
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