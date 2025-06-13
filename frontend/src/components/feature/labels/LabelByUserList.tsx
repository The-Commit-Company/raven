import React, { useEffect, useState, forwardRef, useMemo } from 'react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { MdLabelOutline } from 'react-icons/md'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import { Button, Checkbox, ContextMenu, Dialog, Flex, Popover, Tooltip } from '@radix-ui/themes'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/layout/Drawer'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { IoMdClose } from 'react-icons/io'
import { useAtomValue } from 'jotai'
import { sortedChannelsAtom } from '@/utils/channel/ChannelAtom'

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
      <LabelItemMenu label={label} onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}

// ==== LabelItem Menu ====
const LabelItemMenu = ({ label, onEdit, onDelete }: { label: string; onEdit?: () => void; onDelete?: () => void }) => (
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
      <CreateConversationButton label={label} />
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
const CreateConversationButton = ({ label }: { label: string }) => {
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
      <Dialog.Content className='z-[300] bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl w-[900px] max-w-full max-h-[90vh] overflow-y-auto'>
        <CreateConversationContent setIsOpen={setIsOpen} label={label} />
      </Dialog.Content>
    </Dialog.Root>
  ) : (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{button}</DrawerTrigger>
      <DrawerContent>
        <div className='pb-16 overflow-y-scroll min-h-96'>
          <CreateConversationContent setIsOpen={setIsOpen} label={label} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

type Props = {
  setIsOpen: (v: boolean) => void
  label: string
}
// ==== CreateConversationContent ====
export const CreateConversationContent = ({ setIsOpen, label }: Props) => {
  const channels = useAtomValue(sortedChannelsAtom)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const handleToggle = (channelID: string) => {
    setSelected((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(channelID)) {
        newSet.delete(channelID)
      } else {
        newSet.add(channelID)
      }
      return newSet
    })
  }

  const selectedChannels = useMemo(() => channels.filter((c) => selected.has(c.name)), [selected, channels])

  return (
    <form className='space-y-4'>
      <Dialog.Title className='text-lg font-semibold flex w-full items-center justify-between'>
        <Flex align='center' gap='2'>
          Thêm cuộc trò chuyện vào <span className='italic ml-1'>"{label}"</span>
        </Flex>
        <Dialog.Close>
          <IoMdClose
            type='button'
            className='text-gray-500 hover:text-black dark:hover:text-white transition-colors p-1 ml-auto'
            aria-label='Đóng'
          />
        </Dialog.Close>
      </Dialog.Title>

      <div className='flex gap-4 max-h-[400px] overflow-y-auto border rounded'>
        {/* Cột trái: danh sách channel */}
        <div className='w-1/2 border-r p-2 space-y-1'>
          <input type='text' placeholder='Tìm kiếm' className=' p-2 border rounded text-sm mb-2' />
          {channels.map((channel) => (
            <label
              key={channel.name}
              className='flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-2 dark:hover:bg-gray-7 cursor-pointer'
            >
              <Checkbox checked={selected.has(channel.name)} onCheckedChange={() => handleToggle(channel.name)} />
              <div className='flex items-center gap-2 text-sm truncate'>
                {/* Avatar giả lập */}
                <div className='w-6 h-6 rounded-full bg-gray-5 shrink-0 flex items-center justify-center text-xs font-bold uppercase'>
                  {channel.channel_name?.[0] || '?'}
                </div>
                <div className='truncate'>
                  {channel.channel_name || channel.name}
                  {channel.is_external && (
                    <span className='ml-1 text-[10px] bg-blue-100 text-blue-700 px-1 rounded'>Bên ngoài</span>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Cột phải: đã chọn */}
        <div className='w-1/2 p-2 text-sm'>
          <div className='mb-2 font-medium'>Đã chọn: {selected.size} cuộc trò chuyện</div>
          <div className='space-y-1'>
            {selectedChannels.map((channel) => (
              <div key={channel.name} className='truncate text-gray-12'>
                {channel.channel_name || channel.name}
              </div>
            ))}
            {selectedChannels.length === 0 && <div className='text-gray-500 italic'>Chưa chọn cuộc trò chuyện nào</div>}
          </div>
        </div>
      </div>

      <Flex justify='between' align='center' pt='2'>
        <Dialog.Close>
          <Button variant='ghost' type='button' size='2'>
            Hủy bỏ
          </Button>
        </Dialog.Close>
        <Button type='submit' size='2' disabled={selected.size === 0}>
          Thêm
        </Button>
      </Flex>
    </form>
  )
}
