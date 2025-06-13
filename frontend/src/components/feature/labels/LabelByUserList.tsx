import React, { useEffect, useState, forwardRef } from 'react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { MdLabelOutline } from 'react-icons/md'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import { Button, ContextMenu, Dialog, Flex, Popover, Tooltip } from '@radix-ui/themes'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/layout/Drawer'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { IoMdClose } from 'react-icons/io'

// ==== Common button style ====
const commonButtonStyle = {
  fontWeight: 400,
  fontFamily: 'BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
}

// ==== ForwardRef IconButton để tránh warning ====
const IconButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, ...props }, ref) => (
    <button ref={ref} {...props}>
      {children}
    </button>
  )
)
IconButton.displayName = 'IconButton'

// ==== Label List Component ====
const LabelByUserList = () => {
  const { data, error, isLoading, mutate } = useFrappeGetCall('raven.api.user_label.get_my_labels')

useEffect(() => {
  mutate()

  const handler = () => mutate()
  window.addEventListener('label_created', handler)

  return () => window.removeEventListener('label_created', handler)
}, [])

  if (isLoading) return <div>Đang tải...</div>
  if (error) return <div className='text-red-500'>Lỗi: {error.message}</div>

  const labels = data?.message || []

  return (
    <div className='space-y-2'>
      {labels.length === 0 && <div className='text-gray-500'>Chưa có nhãn nào</div>}
      {labels.map((labelItem: { name: string; label: string }) => (
        <LabelItem key={labelItem.name} label={labelItem.label} />
      ))}
    </div>
  )
}

export default LabelByUserList

// ==== Label Item ====
interface LabelItemProps {
  label: string
  onEdit?: () => void
  onDelete?: () => void
}

const LabelItem: React.FC<LabelItemProps> = ({ label, onEdit, onDelete }) => {
  return (
    <div className='group cursor-pointer flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-3 transition-colors'>
      <div className='flex items-center gap-2 text-sm text-gray-12'>
        <MdLabelOutline className='w-4 h-4 text-gray-11 shrink-0' />
        <span>{label}</span>
      </div>
      <LabelItemMenu onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}

// ==== LabelItem Menu ====
const LabelItemMenu = ({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) => (
  <Popover.Root>
    <Tooltip content='Tuỳ chọn nhãn' delayDuration={300}>
      <Popover.Trigger>
        <IconButton
          className='p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer bg-transparent'
          aria-label='Mở menu nhãn'
        >
          <HiOutlineDotsHorizontal className='w-4 h-4 text-gray-11' />
        </IconButton>
      </Popover.Trigger>
    </Tooltip>
    <Popover.Content className='min-w-[120px] space-y-1'>
      <CreateConversationButton />
      <Button
        className='block w-full text-left justify-start text-black font-light dark:text-white cursor-pointer hover:bg-indigo-500 dark:hover:bg-gray-700 bg-transparent hover:text-white transition-colors'
        style={commonButtonStyle}
        onClick={onEdit}
      >
        Đổi tên
      </Button>
      <Button
        className='block w-full text-left justify-start cursor-pointer bg-transparent text-red-500 hover:text-white hover:bg-red-500 dark:text-red-400 dark:hover:text-white dark:hover:bg-red-600 transition-colors'
        style={commonButtonStyle}
        onClick={onDelete}
      >
        Xoá nhãn
      </Button>
    </Popover.Content>
  </Popover.Root>
)

// ==== CreateConversationButton ====
const CreateConversationButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const isDesktop = useIsDesktop()

  const button = (
    <Button
      className='block w-full text-left justify-start text-black font-light dark:text-white cursor-pointer hover:bg-indigo-500 dark:hover:bg-gray-700 bg-transparent hover:text-white transition-colors'
      style={commonButtonStyle}
    >
      Thêm cuộc trò chuyện
    </Button>
  )

  return isDesktop ? (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>{button}</Dialog.Trigger>
      <Dialog.Content className='z-[300] bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        <CreateConversationContent setIsOpen={setIsOpen} />
      </Dialog.Content>
    </Dialog.Root>
  ) : (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{button}</DrawerTrigger>
      <DrawerContent>
        <div className='pb-16 overflow-y-scroll min-h-96'>
          <CreateConversationContent setIsOpen={setIsOpen} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

// ==== CreateConversationContent ====
const CreateConversationContent = ({ setIsOpen }: { setIsOpen: (v: boolean) => void }) => {
  return (
    <form className='space-y-4'>
      <Dialog.Title className='text-lg font-semibold flex'>
        <Flex align='center' gap='2'>
          Tạo cuộc trò chuyện mới
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
        Nhập thông tin để bắt đầu cuộc trò chuyện với người khác.
      </Dialog.Description>

      {/* Form nội dung */}
      <Flex justify='between' align='center' pt='2'>
        <Flex gap='3' align='center'>
          <Button type='submit' size='2'>
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
  )
}
