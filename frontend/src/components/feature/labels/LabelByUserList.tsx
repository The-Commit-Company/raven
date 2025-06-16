import { useEffect } from 'react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import LabelItem from './LabelItem'

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
      {labels?.length === 0 && <div className='text-gray-500'>Chưa có nhãn nào</div>}
      {labels?.map(
        (labelItem: { channels: { channel_id: string; channel_name: string }[]; label_id: string; label: string }) => (
          <LabelItem
            key={labelItem.label_id}
            label={labelItem.label}
            channelList={labelItem.channels}
            name={labelItem.label_id}
          />
        )
      )}
    </div>
  )
}

export default LabelByUserList
