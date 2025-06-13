import { Popover, Tooltip, Button } from '@radix-ui/themes'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import { forwardRef } from 'react'
import CreateConversationButton from './conversations/CreateConversationButton'

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

const LabelItemMenu = ({ label, onEdit, onDelete }: { label: string; onEdit?: () => void; onDelete?: () => void }) => (
  <Popover.Root>
    <Tooltip content='Tuỳ chọn nhãn' delayDuration={300}>
      <Popover.Trigger>
        <IconButton className='p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer bg-transparent'>
          <HiOutlineDotsHorizontal className='w-4 h-4 text-gray-11' />
        </IconButton>
      </Popover.Trigger>
    </Tooltip>
    <Popover.Content className='min-w-[120px] space-y-1'>
      <CreateConversationButton label={label} />
      <Button
        onClick={onEdit}
        style={commonButtonStyle}
        className='block w-full text-left justify-start font-light text-black dark:text-white cursor-pointer bg-transparent hover:bg-indigo-500 hover:text-white dark:hover:bg-gray-700 transition-colors'
      >
        Đổi tên
      </Button>

      <Button
        onClick={onDelete}
        style={commonButtonStyle}
        className='block w-full text-left justify-start font-light text-red-500 dark:text-red-400 cursor-pointer bg-transparent hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-colors'
      >
        Xoá nhãn
      </Button>
    </Popover.Content>
  </Popover.Root>
)

export default LabelItemMenu
