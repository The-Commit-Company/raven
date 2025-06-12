import React, { useEffect } from 'react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { MdLabelOutline } from 'react-icons/md'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import { Button, ContextMenu, Popover, Tooltip } from '@radix-ui/themes'

// forwardRef để tránh lỗi khi dùng `asChild`
const IconButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, ...props }, ref) => (
    <button ref={ref} {...props}>
      {children}
    </button>
  )
)
IconButton.displayName = 'IconButton'

const LabelByUserList = () => {
  const { data, error, isLoading, mutate } = useFrappeGetCall('raven.api.user_label.get_my_labels')

  useEffect(() => {
    mutate()
  }, [])

  if (isLoading) return <div>Đang tải...</div>
  if (error) return <div className='text-red-500'>Lỗi: {error.message}</div>

  const labels = data?.message || []

  return (
    <div className='space-y-2'>
      <h3 className='text-lg font-semibold'>Các nhãn bạn đã tạo:</h3>
      {labels.length === 0 && <div className='text-gray-500'>Chưa có nhãn nào</div>}
      {labels.map((labelItem: { name: string; label: string }) => (
        <LabelItem key={labelItem.name} label={labelItem.label} />
      ))}
    </div>
  )
}

export default LabelByUserList

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

      <Popover.Root>
        <Tooltip content='Tuỳ chọn nhãn' delayDuration={300}>
          <Popover.Trigger>
            <IconButton
              className='p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer'
              aria-label='Mở menu nhãn'
            >
              <HiOutlineDotsHorizontal className='w-4 h-4 text-gray-11' />
            </IconButton>
          </Popover.Trigger>
        </Tooltip>
        <Popover.Content className='min-w-[120px] space-y-1'>
          <Button variant='ghost' color='gray' size='1' className='w-full justify-start' onClick={onEdit}>
            Đổi tên
          </Button>
          <Button variant='ghost' color='red' size='1' className='w-full justify-start' onClick={onDelete}>
            Xoá nhãn
          </Button>
        </Popover.Content>
      </Popover.Root>
    </div>
  )
}
