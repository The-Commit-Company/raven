import { Popover, Tooltip, Button } from '@radix-ui/themes'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import { forwardRef, useEffect, useState } from 'react'

import { lazy, Suspense } from 'react'
import EditLabelModal from './EditLabelModal'
import DeleteLabelModal from './DeleteLabelModal'

const CreateConversationModal = lazy(() => import('./conversations/CreateConversationModal'))

const IconButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, ...props }, ref) => (
    <button ref={ref} {...props}>
      {children}
    </button>
  )
)
IconButton.displayName = 'IconButton'

export const commonButtonStyle = {
  fontWeight: 400,
  fontFamily: 'BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
}

// Hook để phát hiện thiết bị có hỗ trợ touch hay không
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const handleTouch = () => setIsTouch(true)
    window.addEventListener('touchstart', handleTouch, { once: true })

    return () => {
      window.removeEventListener('touchstart', handleTouch)
    }
  }, [])

  return isTouch
}

const LabelItemMenu = ({ name, label, channels }: { name: string; label: string; channels: any[] }) => {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const isTouch = useIsTouchDevice()

  const triggerButton = (
    <Popover.Trigger>
      <IconButton
        onClick={(e) => {
          e.stopPropagation()
        }}
        className='p-1 rounded-md duration-150 cursor-pointer bg-transparent absolute right-3 top-1/2 -translate-y-1/2'
      >
        <HiOutlineDotsHorizontal className='w-4 h-4 text-gray-11' />
      </IconButton>
    </Popover.Trigger>
  )

  return (
    <>
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        {!isTouch ? (
          <Tooltip content='Tuỳ chọn nhãn' delayDuration={300}>
            {triggerButton}
          </Tooltip>
        ) : (
          triggerButton
        )}

        <Popover.Content className='min-w-[120px] space-y-1'>
          <Button
            onClick={() => {
              setPopoverOpen(false)
              setIsCreateOpen(true)
            }}
            style={commonButtonStyle}
            className='block w-full text-left justify-start font-light text-black dark:text-white cursor-pointer bg-transparent hover:bg-indigo-500 hover:text-white dark:hover:bg-gray-700 transition-colors'
          >
            Thêm cuộc trò chuyện
          </Button>

          <Button
            onClick={() => {
              setPopoverOpen(false)
              setIsEditOpen(true)
            }}
            style={commonButtonStyle}
            className='block w-full text-left justify-start font-light text-black dark:text-white cursor-pointer bg-transparent hover:bg-indigo-500 hover:text-white dark:hover:bg-gray-700 transition-colors'
          >
            Đổi tên
          </Button>

          <Button
            onClick={() => {
              setPopoverOpen(false)
              setIsDeleteOpen(true)
            }}
            style={commonButtonStyle}
            className='block w-full text-left justify-start font-light text-red-500 dark:text-red-500 cursor-pointer bg-transparent hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors'
          >
            Xoá nhãn
          </Button>
        </Popover.Content>
      </Popover.Root>

      {/* Modal hoặc Drawer */}
      <Suspense fallback={null}>
        <CreateConversationModal
          channels={channels}
          name={name}
          label={label}
          isOpen={isCreateOpen}
          setIsOpen={setIsCreateOpen}
        />
      </Suspense>
      <Suspense fallback={null}>
        <EditLabelModal name={name} label={label} isOpen={isEditOpen} setIsOpen={setIsEditOpen} />
      </Suspense>
      <Suspense fallback={null}>
        <DeleteLabelModal name={name} label={label} isOpen={isDeleteOpen} setIsOpen={setIsDeleteOpen} />
      </Suspense>
    </>
  )
}

export default LabelItemMenu
