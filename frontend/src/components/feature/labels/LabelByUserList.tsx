import BeatLoader from '@/components/layout/Loaders/BeatLoader'
import { Flex, Text } from '@radix-ui/themes'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { LuAtSign } from 'react-icons/lu'
import { refreshLabelListAtom } from './conversations/atoms/labelAtom'
import LabelItem from './LabelItem'

interface Label {
  label_id: string
  label: string
  channels: {
    channel_id: string
    channel_name: string
    is_direct_message: boolean
  }[]
}

const LabelByUserList = () => {
  const refreshKey = useAtomValue(refreshLabelListAtom)

  const { data, error, isLoading, mutate } = useFrappeGetCall<{ message: Label[] }>(
    'raven.api.user_label.get_my_labels'
  )

  // Gọi lại API khi refreshKey thay đổi
  useEffect(() => {
    mutate()
  }, [refreshKey])

  const labels: Label[] = data?.message || []

  if (isLoading && labels?.length === 0) return <BeatLoader text='Đang tải label...' />
  if (error && labels?.length === 0) return <div className='text-red-500'>Lỗi: {error.message}</div>

  return (
    <div className='space-y-2'>
      {labels?.length === 0 ? (
        <Flex direction='column' align='center' justify='center' className='h-[320px] px-6 text-center'>
          <LuAtSign size={48} className='text-gray-8 mb-4' />
          <Text size='5' weight='medium' className='mb-2'>
            Chưa có nhãn nào
          </Text>
          <Text size='2' color='gray'>
            Bạn có thể tạo nhãn tại đây
          </Text>
        </Flex>
      ) : (
        labels?.map((labelItem) => (
          <LabelItem
            channels={labelItem.channels}
            key={labelItem.label_id}
            label={labelItem.label}
            name={labelItem.label_id}
          />
        ))
      )}
    </div>
  )
}

export default LabelByUserList
