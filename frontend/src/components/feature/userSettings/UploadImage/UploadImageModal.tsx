import { Loader } from "@/components/common/Loader"
import { useUserData } from "@/hooks/useUserData"
import { Button, Dialog, Flex } from "@radix-ui/themes"
import { CustomFile } from "../../file-upload/FileDrop"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { useState } from "react"
import { FrappeError, useFrappeFileUpload } from "frappe-react-sdk"
import { FileUploadBox } from "./FileUploadBox"
import { __ } from "@/utils/translations"

interface UploadImageModalProps {
    onClose: () => void,
    uploadImage: (file: string) => void
}

export const UploadImageModal = ({ onClose, uploadImage }: UploadImageModalProps) => {

    const [file, setFile] = useState<CustomFile | undefined>()
    const [fileError, setFileError] = useState<FrappeError>()

    const { upload, loading } = useFrappeFileUpload()

    const onFileChange = (newFile: CustomFile | undefined) => {
        setFile(newFile)
    }

    const userData = useUserData()

    const uploadFiles = async () => {
        if (file) {
            return upload(file, {
                doctype: 'Raven User',
                docname: userData.name,
                fieldname: 'user_image',
                isPrivate: true,
            }).then((res) => {
                uploadImage(res.file_url)
                onClose()
            }).catch((e) => {
                setFileError(e)
            })
        }
    }

    return (
        <>
            <Dialog.Title>{__("Upload file")}</Dialog.Title>

            <ErrorBanner error={fileError} />

            <FileUploadBox
                file={file}
                onFileChange={onFileChange}
                accept={{ 'image/*': ['.jpeg', '.jpg', '.png'] }}
                maxFileSize={10}
            />

            <Flex gap="3" mt="6" justify="end" align='center'>
                <Dialog.Close disabled={loading}>
                    <Button variant="soft" color="gray">{__("Cancel")}</Button>
                </Dialog.Close>
                <Button type='button' onClick={uploadFiles} disabled={loading}>
                    {loading && <Loader />}
                    {loading ? __("Saving") : __("Save")}
                </Button>
            </Flex>
        </>
    )
}