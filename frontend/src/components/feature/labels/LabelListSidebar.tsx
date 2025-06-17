import { MdLabelOutline } from 'react-icons/md'
import clsx from 'clsx'
import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'

import { useSidebarMode } from '@/utils/layout/sidebar'
import { labelListAtom, refreshLabelListAtom } from './conversations/atoms/labelAtom'
import { useFrappeGetCall } from 'frappe-react-sdk'

type Props = {
  visible: boolean
  onClickLabel: (label: { labelId: string; labelName: string }) => void
}

export default function LabelList({ visible, onClickLabel }: Props) {
  const labelList = useAtomValue(labelListAtom)
  const setLabelList = useSetAtom(labelListAtom)
  const refreshKey = useAtomValue(refreshLabelListAtom)
  const { title, setLabelID } = useSidebarMode()

  const { data, isLoading, error, mutate } = useFrappeGetCall('raven.api.user_label.get_my_labels')

  // Luôn gọi mutate mỗi khi sidebar mở ra
  useEffect(() => {
    if (visible && labelList.length === 0) {
      mutate()
    }
  }, [visible, labelList.length])

  // Gọi lại API nếu có thay đổi từ nơi khác (refreshKey tăng)
  useEffect(() => {
    if (refreshKey > 0) {
      mutate()
    }
  }, [refreshKey])

  // Cập nhật atom sau khi có kết quả từ API
  useEffect(() => {
    if (data?.message) {
      setLabelList(data.message)
    }
  }, [data])

  if (!visible) return null
  if (isLoading && labelList.length === 0) return <div className='text-sm text-gray-500 px-3'>Đang tải...</div>
  if (error && labelList.length === 0) return <div className='text-sm text-red-500 px-3'>Lỗi tải nhãn</div>

  return (
    <ul className='mt-1 space-y-1'>
      {labelList?.map((item) => (
        <li
          key={item.label_id}
          onClick={() => {
            onClickLabel({
              labelName: item.label,
              labelId: item.label_id
            })
            setLabelID(item.label_id)
          }}
          className={clsx(
            'flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-2 cursor-pointer',
            typeof title === 'object' && title.labelName === item.label && 'bg-gray-3 font-semibold pl-5'
          )}
        >
          <MdLabelOutline className='w-4 h-4 text-gray-11 shrink-0' />
          <span className='truncate'>{item.label}</span>
        </li>
      ))}
    </ul>
  )
}
