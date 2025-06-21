import { ErrorText, HelperText, Label } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { Stack } from '@/components/layout/Stack'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { RavenWorkspace } from '@/types/Raven/RavenWorkspace'
import { __ } from '@/utils/translations'
import { Box, Button, Checkbox, Dialog, Flex, RadioGroup, Text, TextArea, TextField } from '@radix-ui/themes'
import { useFrappeCreateDoc, useFrappeFileUpload, useFrappeUpdateDoc, useSWRConfig } from 'frappe-react-sdk'
import { useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { CustomFile } from '../file-upload/FileDrop'
import { FileUploadBox } from '../userSettings/UploadImage/FileUploadBox'

const AddWorkspaceForm = ({ onClose }: { onClose: (workspaceID?: string) => void }) => {
  const { mutate } = useSWRConfig()

  const methods = useForm<RavenWorkspace>({
    defaultValues: {
      type: 'Public'
    }
  })

  const [image, setImage] = useState<CustomFile | undefined>(undefined)
  const [workspaceNameLength, setWorkspaceNameLength] = useState(0)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = methods

  const { createDoc, loading: creatingDoc, error } = useFrappeCreateDoc<RavenWorkspace>()
  const { updateDoc, loading: updatingDoc } = useFrappeUpdateDoc()
  const { upload, loading: uploadingFile, error: fileError } = useFrappeFileUpload()

  const onSubmit = (data: RavenWorkspace) => {
    createDoc('Raven Workspace', data)
      .then((res) => {
        if (image) {
          return upload(image, {
            doctype: 'Raven Workspace',
            docname: res.name,
            fieldname: 'logo',
            otherData: {
              optimize: '1'
            },
            isPrivate: false
          }).then((fileRes) => {
            return updateDoc('Raven Workspace', res.name, {
              logo: fileRes.file_url
            })
          })
        }
        return res
      })
      .then((res) => {
        mutate('workspaces_list')
        mutate('channel_list')
        toast.success('Workspace created', {
          description: `Bạn có thể mời thành viên vào ${res.workspace_name}`,
          duration: 2000
        })
        onClose(res.name)
      })
  }

  const isDesktop = useIsDesktop()
  const loading = creatingDoc || uploadingFile || updatingDoc

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack py='4'>
          <ErrorBanner error={error} />
          <ErrorBanner error={fileError} />

          {/* Tên Workspace */}
          <Stack>
            <Box>
              <Label htmlFor='workspace_name' isRequired>
                Tên Workspace
              </Label>
              <TextField.Root
                id='workspace_name'
                {...register('workspace_name', {
                  required: 'Tên workspace không được để trống',
                  maxLength: {
                    value: 140,
                    message: 'Tên workspace tối đa 140 ký tự'
                  }
                })}
                autoFocus={isDesktop}
                placeholder='VD: Phòng Thiết Kế'
                maxLength={140}
                aria-invalid={errors.workspace_name ? 'true' : 'false'}
                onChange={(e) => {
                  setWorkspaceNameLength(e.target.value.length)
                  methods.setValue('workspace_name', e.target.value)
                }}
              />
              <Flex justify='end' mt='1'>
                <Text size='1' color={workspaceNameLength > 140 ? 'red' : 'gray'}>
                  {workspaceNameLength}/140
                </Text>
              </Flex>
            </Box>
            {errors.workspace_name && <ErrorText>{errors.workspace_name?.message}</ErrorText>}
          </Stack>

          {/* Mô tả */}
          <Stack>
            <Box>
              <Label htmlFor='description'>Mô tả</Label>
              <TextArea
                id='description'
                {...register('description')}
                rows={2}
                resize='vertical'
                placeholder='Mô tả workspace này dùng cho mục đích gì?'
                aria-invalid={errors.description ? 'true' : 'false'}
              />
            </Box>
            {errors.description && <ErrorText>{errors.description?.message}</ErrorText>}
          </Stack>

          {/* Loại workspace */}
          <Stack>
            <Label htmlFor='channel_type'>Loại Workspace</Label>
            <Controller
              name='type'
              control={control}
              render={({ field }) => (
                <RadioGroup.Root
                  defaultValue='Public'
                  variant='soft'
                  id='channel_type'
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <Flex gap='4'>
                    <Text as='label' size='2'>
                      <Flex gap='2'>
                        <RadioGroup.Item value='Public' /> {__('Công khai')}
                      </Flex>
                    </Text>
                    <Text as='label' size='2'>
                      <Flex gap='2'>
                        <RadioGroup.Item value='Private' /> {__('Riêng tư')}
                      </Flex>
                    </Text>
                  </Flex>
                </RadioGroup.Root>
              )}
            />
            <HelperText>{helperText}</HelperText>
          </Stack>

          {/* Chỉ admin tạo kênh */}
          <Stack py='2'>
            <Text as='label' size='2'>
              <Controller
                control={control}
                name={'only_admins_can_create_channels'}
                render={({ field: { value, onChange, onBlur, name, disabled, ref } }) => (
                  <Checkbox
                    checked={!!value}
                    disabled={disabled}
                    name={name}
                    aria-invalid={errors.only_admins_can_create_channels ? 'true' : 'false'}
                    onBlur={onBlur}
                    ref={ref}
                    onCheckedChange={(v) => onChange(v ? 1 : 0)}
                  />
                )}
              />
              &nbsp; Chỉ quản trị viên có thể tạo kênh trong workspace này?
            </Text>
          </Stack>

          {/* Upload Logo */}
          <Stack gap='0'>
            <Label htmlFor='workspace_image'>Logo Workspace</Label>
            <FileUploadBox
              file={image}
              onFileChange={setImage}
              hideIfLimitReached
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.svg', '.webp'] }}
              maxFileSize={10}
            />
          </Stack>
        </Stack>

        {/* Submit / Cancel */}
        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close disabled={loading}>
            <Button variant='soft' color='gray'>
              {__('Hủy')}
            </Button>
          </Dialog.Close>
          <Button type='submit' disabled={loading}>
            {loading && <Loader />}
            {loading ? __('Đang lưu') : __('Lưu')}
          </Button>
        </Flex>
      </form>
    </FormProvider>
  )
}

const helperText = __(
  'Khi một không gian làm việc được đặt ở chế độ riêng tư, chỉ những người được mời mới có thể xem hoặc tham gia. Khi không gian làm việc được đặt ở chế độ công khai, bất kỳ ai cũng có thể tham gia và xem các kênh trong đó.'
)

export default AddWorkspaceForm
