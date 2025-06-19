import { CustomFile } from '@/components/feature/file-upload/FileDrop'
import { FileUploadBox } from '@/components/feature/userSettings/UploadImage/FileUploadBox'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { Stack } from '@/components/layout/Stack'
import { RavenCustomEmoji } from '@/types/RavenMessaging/RavenCustomEmoji'
import { __ } from '@/utils/translations'
import { Box, Button, Dialog, Flex, TextField, VisuallyHidden } from '@radix-ui/themes'
import { FrappeConfig, FrappeContext, useFrappeCreateDoc, useFrappeFileUpload } from 'frappe-react-sdk'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ErrorText, HelperText, Label } from '../Form'
import { Loader } from '../Loader'

type Props = {
  open: boolean
  onClose: (refresh?: boolean) => void
}

const AddCustomEmojiDialog = ({ open, onClose }: Props) => {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Content>
        <Dialog.Title>Thêm Emoji</Dialog.Title>
        <VisuallyHidden>
          <Dialog.Description size='2'>Thêm emoji tùy chỉnh vào cuộc trò chuyện.</Dialog.Description>
        </VisuallyHidden>
        <AddEmojiForm onClose={onClose} />
      </Dialog.Content>
    </Dialog.Root>
  )
}

const AddEmojiForm = ({ onClose }: { onClose: (refresh?: boolean) => void }) => {
  const { call } = useContext(FrappeContext) as FrappeConfig

  const [image, setImage] = useState<CustomFile | undefined>(undefined)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    setFocus
  } = useForm<RavenCustomEmoji>({
    defaultValues: {
      emoji_name: '',
      keywords: ''
    },
    mode: 'onBlur'
  })

  const { createDoc, loading, error } = useFrappeCreateDoc<RavenCustomEmoji>()
  const { upload, loading: uploading, error: uploadError } = useFrappeFileUpload()

  const onSubmit = async (data: RavenCustomEmoji) => {
    if (!image) return

    const exists = await checkIfEmojiNameExists(data.emoji_name)
    if (exists) {
      setError('emoji_name', { message: `Emoji ${data.emoji_name} already exists.` }, { shouldFocus: true })
      return
    }

    upload(image, {
      doctype: 'Raven Custom Emoji',
      docname: data.emoji_name,
      fieldname: 'emoji_image'
    })
      .then((file) => {
        return createDoc('Raven Custom Emoji', {
          ...data,
          image: file.file_url
        })
      })
      .then(() => {
        onClose(true)
      })
  }

  const onImageChange = (file?: CustomFile) => {
    if (file) {
      setImage(file)
      // Get the name of the file and set it as the emoji name
      const name = file.name.split('.').slice(0, -1).join('.')
      setValue('emoji_name', name, { shouldValidate: true })
      setFocus('emoji_name')
    } else {
      setImage(undefined)
    }
  }

  const checkIfEmojiNameExists = async (name: string) => {
    const emoji = await call.get('frappe.client.get_count', {
      doctype: 'Raven Custom Emoji',
      filters: {
        emoji_name: name
      }
    })
    return emoji?.message > 0
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <ErrorBanner error={error} />
        <ErrorBanner error={uploadError} />
        <Stack gap='0'>
          <Label htmlFor='emoji_image'>Emoji</Label>
          <HelperText>Ảnh có kích thước 128x128 pixel là phù hợp nhất.</HelperText>
          <FileUploadBox
            file={image}
            onFileChange={onImageChange}
            accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.svg', '.gif'] }}
            maxFileSize={1}
            hideIfLimitReached={true}
          />
        </Stack>
        <Stack>
          <Box>
            <Label htmlFor='emoji_name' isRequired>
              Emoji Name
            </Label>
            <TextField.Root
              id='emoji_name'
              {...register('emoji_name', {
                required: 'Name is required',
                maxLength: {
                  value: 20,
                  message: 'Name must be less than 20 characters'
                },
                validate: async (value) => {
                  const exists = await checkIfEmojiNameExists(value)
                  return exists ? 'Emoji name already exists' : true
                }
              })}
              placeholder='e.g. jawdrop'
              aria-invalid={errors.emoji_name ? 'true' : 'false'}
            />
          </Box>
          {errors.emoji_name && <ErrorText>{errors.emoji_name?.message}</ErrorText>}
        </Stack>

        <Stack>
          <Box>
            <Label htmlFor='keywords'>Keywords</Label>
            <TextField.Root
              id='keywords'
              {...register('keywords')}
              placeholder='e.g. shocked, surprised, omg'
              aria-invalid={errors.keywords ? 'true' : 'false'}
            />
          </Box>
          <HelperText>Bạn có thể tìm kiếm emoji này bằng các từ khóa trên. (Không bắt buộc)</HelperText>
          {errors.keywords && <ErrorText>{errors.keywords?.message}</ErrorText>}
        </Stack>
        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close disabled={loading || uploading}>
            <Button variant='soft' color='gray'>
              {__('Hủy')}
            </Button>
          </Dialog.Close>
          <Button type='submit' disabled={loading || uploading}>
            {loading || (uploading && <Loader />)}
            {loading || uploading ? __('Saving') : __('Lưu')}
          </Button>
        </Flex>
      </Stack>
    </form>
  )
}

export default AddCustomEmojiDialog
