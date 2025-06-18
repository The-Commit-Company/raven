import { useEffect } from 'react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { labelListAtom, refreshLabelListAtom } from './conversations/atoms/labelAtom'
import LabelItem from './LabelItem'
import BeatLoader from '@/components/layout/Loaders/BeatLoader'

interface Label {
  label_id: string
  label: string
}

const LabelByUserList = () => {
  const labelsInAtom = useAtomValue(labelListAtom)
  const setLabels = useSetAtom(labelListAtom)
  const refreshKey = useAtomValue(refreshLabelListAtom)

  const { data, error, isLoading, mutate } = useFrappeGetCall<{ message: Label[] }>(
    'raven.api.user_label.get_my_labels'
  )

  // Gọi lại API khi refreshKey thay đổi
  useEffect(() => {
    mutate()
  }, [refreshKey])

  // Nếu atom rỗng và chưa có data, gọi API
  useEffect(() => {
    if (labelsInAtom.length === 0 && !data) {
      mutate()
    }
  }, [labelsInAtom.length, data])

  // Sau khi fetch xong thì gán vào atom
  useEffect(() => {
    if (data?.message) {
      setLabels(data.message)
    }
  }, [data, setLabels])

  const labels: Label[] = labelsInAtom.length > 0 ? labelsInAtom : data?.message || []

  if (isLoading && labels.length === 0) return <BeatLoader text='Đang tải label...' />
  if (error && labels.length === 0) return <div className='text-red-500'>Lỗi: {error.message}</div>

  return (
    <div className='space-y-2'>
      {labels.length === 0 ? (
        <div className='text-gray-500'>Chưa có nhãn nào</div>
      ) : (
        labels.map((labelItem) => (
          <LabelItem key={labelItem.label_id} label={labelItem.label} name={labelItem.label_id} />
        ))
      )}
    </div>
  )
}

export default LabelByUserList
