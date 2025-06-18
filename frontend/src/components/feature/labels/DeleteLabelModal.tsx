import { Dialog, Button, Flex, Text } from '@radix-ui/themes'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useSetAtom } from 'jotai'
import { refreshLabelListAtom } from './conversations/atoms/labelAtom'
import { toast } from 'sonner'

type Props = {
  name: string // label_id
  label: string // label name
  isOpen: boolean
  setIsOpen: (v: boolean) => void
}

const DeleteLabelModal = ({ name, label, isOpen, setIsOpen }: Props) => {
  const { call, loading: isLoading } = useFrappePostCall('raven.api.user_label.delete_label')
  const setRefreshKey = useSetAtom(refreshLabelListAtom)

  const handleDelete = async () => {
    try {
      const res = await call({ label_id: name })
      const message = res?.message?.message

      if (message === 'Label deleted') {
        toast.success(`Xóa nhãn thành công`)
        setRefreshKey((prev) => prev + 1)
        setIsOpen(false)
      } else {
        console.error('Lỗi không rõ:', res)
        toast.error('Không thể xoá nhãn. Vui lòng thử lại.')
      }
    } catch (err) {
      console.error('Lỗi khi xoá nhãn:', err)
      toast.error('Có lỗi xảy ra trong quá trình xoá nhãn.')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content className='max-w-md bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg z-[300]'>
        <Dialog.Title>Xác nhận xoá</Dialog.Title>
        <Text as='p' size='3' className='mb-4'>
          Bạn có chắc muốn xoá nhãn <strong>{label}</strong> không?
        </Text>
        <Flex justify='end' align='center' gap='3'>
          <Button variant='soft' onClick={() => setIsOpen(false)} className='cursor-pointer' disabled={isLoading}>
            Huỷ
          </Button>
          <Button color='red' onClick={handleDelete} disabled={isLoading} className='cursor-pointer'>
            {isLoading ? 'Đang xoá...' : 'Xoá'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default DeleteLabelModal
