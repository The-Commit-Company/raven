import { useEffect } from 'react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import LabelItem from './LabelItem'
import { refreshLabelListAtom } from './conversations/atoms/labelAtom'
import { useAtomValue } from 'jotai'


const LabelByUserList = () => {
  const { data, error, isLoading, mutate } = useFrappeGetCall('raven.api.user_label.get_my_labels')

  const refreshKey = useAtomValue(refreshLabelListAtom)

  useEffect(() => {
    mutate()
  }, [refreshKey])

  if (isLoading) return <div>Đang tải...</div>
  if (error) return <div className='text-red-500'>Lỗi: {error.message}</div>

  const labels = data?.message || []

  return (
    <div className='space-y-2'>
      {labels.length === 0 && <div className='text-gray-500'>Chưa có nhãn nào</div>}
      {labels.map((labelItem: { label_id: string; label: string }) => (
        <LabelItem key={labelItem.label_id} label={labelItem.label} name={labelItem.label_id} />
      ))}
    </div>
  )
}

export default LabelByUserList
