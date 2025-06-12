import { useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import { Dialog } from '@radix-ui/themes'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Box, Button, Flex, IconButton, TextField } from '@radix-ui/themes'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/layout/Drawer'
import { toast } from 'sonner'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Label } from '@/components/common/Form'
import { useFrappePostCall } from 'frappe-react-sdk'
import { IoMdClose } from 'react-icons/io'

interface CreateLabelForm {
  label: string
}

const DIALOG_CONTENT_CLASS =
  'z-[300] bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'

export const CreateLabelButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger>
          <IconButton
            variant='soft'
            size='1'
            radius='large'
            color='gray'
            aria-label='Tạo nhãn'
            title='Tạo nhãn'
            className='transition-all ease-ease text-gray-10 bg-transparent hover:bg-gray-3 hover:text-gray-12 cursor-pointer'
          >
            <FiPlus size='16' />
          </IconButton>
        </Dialog.Trigger>
        <Dialog.Content className={DIALOG_CONTENT_CLASS}>
          <CreateLabelContent isOpen={isOpen} setIsOpen={setIsOpen} />
        </Dialog.Content>
      </Dialog.Root>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <IconButton
          variant='soft'
          size='1'
          radius='large'
          color='gray'
          aria-label='Tạo nhãn'
          title='Tạo nhãn'
          className='transition-all ease-ease text-gray-10 bg-transparent hover:bg-gray-3 hover:text-gray-12'
        >
          <FiPlus size='16' />
        </IconButton>
      </DrawerTrigger>
      <DrawerContent>
        <div className='pb-16 overflow-y-scroll min-h-96'>
          <CreateLabelContent isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export const CreateLabelContent = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) => {
  const methods = useForm<CreateLabelForm>({
    defaultValues: { label: '' }
  })

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset
  } = methods

  const labelValue = watch('label') || ''
  const { call, loading } = useFrappePostCall('raven.api.user_label.create_label')

  const onSubmit = async (data: CreateLabelForm) => {
    try {
      await call({ label: data.label.trim() })
      toast.success('Đã tạo nhãn')
      reset()
      setIsOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Không thể tạo nhãn')
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <Dialog.Title className='text-lg font-semibold flex'>
          <Flex align='center' gap='2'>
            Nhãn mới
            {!!labelValue.trim() && (
              <span className='text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded'>{labelValue}</span>
            )}
          </Flex>
          <Dialog.Close>
            <IoMdClose
              type='button'
              className='text-gray-500 hover:text-black dark:hover:text-white transition-colors p-1 ml-auto'
              aria-label='Đóng'
            />
          </Dialog.Close>
        </Dialog.Title>
        <Dialog.Description className='text-sm text-gray-500'>
          Nhập tên nhãn để tạo mới. Chỉ bạn có thể thấy nhãn này.
        </Dialog.Description>

        <Box>
          <Label htmlFor='label' size='2' className='font-medium'>
            Tên nhãn <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='label'
            control={control}
            rules={{
              required: 'Vui lòng nhập tên nhãn',
              maxLength: { value: 50, message: 'Tên nhãn không quá 50 ký tự' }
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField.Root
                id='label'
                placeholder='Vui lòng nhập tên nhãn'
                required
                color={error ? 'red' : undefined}
                {...field}
              />
            )}
          />
          {errors.label && <div className='text-red-500 text-sm pt-1'>{errors.label.message}</div>}
        </Box>

        <Flex justify='between' align='center' pt='2'>
          {/* <Button type='button' variant='soft' size='1'>
            Thêm quy tắc nhãn
          </Button> */}
          <Flex gap='3' align='center'>
            <Button type='submit' size='2' disabled={loading}>
              Tạo
            </Button>
            <Dialog.Close>
              <Button variant='ghost' type='button' size='2'>
                Hủy bỏ
              </Button>
            </Dialog.Close>
          </Flex>
        </Flex>
      </form>
    </FormProvider>
  )
}
