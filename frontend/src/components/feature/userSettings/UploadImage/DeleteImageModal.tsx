import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { AlertDialog, Button, Flex, Text } from '@radix-ui/themes'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { Loader } from '@/components/common/Loader'
import useCurrentRavenUser from '@/hooks/useCurrentRavenUser'
import { __ } from '@/utils/translations'

interface DeleteImageModalProps {
  onClose: () => void
}

export const DeleteImageModal = ({ onClose }: DeleteImageModalProps) => {
  const { call, loading, error } = useFrappePostCall('raven.api.raven_users.update_raven_user')
  const { mutate } = useCurrentRavenUser()

  const removeImage = () => {
    call({
      user_image: ''
    }).then(() => {
      toast.success('Ảnh đại diện đã được gỡ.')
      mutate()
      onClose()
    })
  }

  return (
    <>
      <AlertDialog.Title>{__('Xóa ảnh')}</AlertDialog.Title>

      <Flex direction={'column'} gap='2'>
        <ErrorBanner error={error} />
        <Text>{__('Bạn có chắc muốn xóa ảnh này không?')}</Text>
      </Flex>

      <Flex gap='3' mt='4' justify='end'>
        <AlertDialog.Cancel>
          <Button variant='soft' color='gray'>
            {__('Hủy')}
          </Button>
        </AlertDialog.Cancel>
        <AlertDialog.Action>
          <Button variant='solid' color='red' onClick={removeImage} disabled={loading}>
            {loading && <Loader />}
            {loading ? __('Đang xóa...') : __('Xóa')}
          </Button>
        </AlertDialog.Action>
      </Flex>
    </>
  )
}
