import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { __ } from '@/utils/translations'
import { Button, Dialog, Flex } from '@radix-ui/themes'
import { FrappeError, useFrappeFileUpload } from 'frappe-react-sdk'
import { useState } from 'react'
import { CustomFile } from '../../file-upload/FileDrop'
import { FileUploadBox } from './FileUploadBox'

interface UploadImageModalProps {
  uploadImage: (file: string) => void
  label?: string
  doctype: string
  docname: string
  fieldname: string
  isPrivate?: boolean
}

export const UploadImageModal = ({
  uploadImage,
  label = 'Thay đổi ảnh đại diện',
  doctype,
  docname,
  fieldname,
  isPrivate = true
}: UploadImageModalProps) => {
  const [file, setFile] = useState<CustomFile | undefined>()
  const [fileError, setFileError] = useState<FrappeError>()

  const { upload, loading } = useFrappeFileUpload()

  const onFileChange = (newFile: CustomFile | undefined) => {
    setFile(newFile)
  }

  const uploadFiles = async () => {
    if (file) {
      return upload(file, {
        doctype: doctype,
        docname: docname,
        fieldname: fieldname,
        otherData: {
          optimize: '1'
        },
        isPrivate: isPrivate
      })
        .then((res) => {
          uploadImage(res.file_url)
        })
        .catch((e) => {
          setFileError(e)
        })
    }
  }

  return (
    <>
      <Dialog.Title>{label}</Dialog.Title>

      <ErrorBanner error={fileError} />

      <FileUploadBox
        file={file}
        onFileChange={onFileChange}
        accept={{ 'image/*': ['.jpeg', '.jpg', '.png'] }}
        maxFileSize={10}
      />

      <Flex gap='3' mt='6' justify='end' align='center'>
        <Dialog.Close disabled={loading}>
          <Button variant='soft' color='gray'>
            {__('Hủy')}
          </Button>
        </Dialog.Close>
        <Button type='button' onClick={uploadFiles} disabled={loading}>
          {loading && <Loader />}
          {loading ? __('Đang tải lên...') : __('Tải lên')}
        </Button>
      </Flex>
    </>
  )
}
