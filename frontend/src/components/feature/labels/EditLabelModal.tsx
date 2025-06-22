import { Button, Dialog, Flex } from '@radix-ui/themes'
import { useState } from 'react'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useSetAtom } from 'jotai'
import { refreshLabelListAtom } from './conversations/atoms/labelAtom'
import { toast } from 'sonner'
import { useUpdateChannelLabels } from '@/utils/channel/ChannelAtom'

type Props = {
  name: string // label_id
  label: string // label name
  isOpen: boolean
  setIsOpen: (v: boolean) => void
}

const EditLabelModal = ({ name, label, isOpen, setIsOpen }: Props) => {
  const [newLabel, setNewLabel] = useState(label)
  const { call, loading: isLoading } = useFrappePostCall('raven.api.user_label.update_label')
  const setRefreshKey = useSetAtom(refreshLabelListAtom)
  const { renameLabel } = useUpdateChannelLabels()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newLabel.trim()
    if (!trimmed) return

    if (newLabel === label) {
      setIsOpen(false)
      toast.success('Nhãn đã được cập nhật')
      return
    }

    try {
      const res = await call({
        label_id: name,
        new_label: trimmed
      })

      const message = res?.message?.message

      if (message === 'Label updated') {
        renameLabel(name, trimmed)
        setRefreshKey((prev) => prev + 1)
        setIsOpen(false)
        toast.success('Nhãn đã được cập nhật')
      } else {
        console.error('Lỗi không rõ:', res)
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật nhãn:', err)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Title>Đổi tên nhãn</Dialog.Title>
        <Dialog.Description className='text-sm text-gray-500'>
          Nhập tên mới cho nhãn. Tối đa 60 ký tự.
        </Dialog.Description>

        <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className='w-full border rounded p-2 text-sm dark:bg-gray-900 dark:text-white'
            placeholder='Tên mới cho nhãn'
            autoFocus
            disabled={isLoading}
            maxLength={60} // ✅ Giới hạn 60 ký tự
          />

          <Flex justify='between' mt='1'>
            <div className='text-transparent text-sm'>Ẩn</div>
            <div className='text-sm text-gray-500'>{newLabel.length}/60</div>
          </Flex>

          <Flex align='center' justify='end' gap='3'>
            <Dialog.Close>
              <Button type='button' variant='soft' size='2' className='cursor-pointer' disabled={isLoading}>
                Hủy
              </Button>
            </Dialog.Close>

            <Button type='submit' size='2' className='cursor-pointer' disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default EditLabelModal
