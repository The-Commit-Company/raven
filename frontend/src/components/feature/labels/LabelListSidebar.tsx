import { MdLabelOutline } from 'react-icons/md'
import clsx from 'clsx'
import { useSidebarMode } from '@/utils/layout/sidebar'
import { useAtomValue, useSetAtom } from 'jotai'
import { labelListAtom, refreshLabelListAtom } from './conversations/atoms/labelAtom'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useEffect } from 'react'

type Props = {
  visible: boolean
  onClickLabel: (label: string) => void
}

export default function LabelList({ visible, onClickLabel }: Props) {
  const labelList = useAtomValue(labelListAtom)
  const setLabelList = useSetAtom(labelListAtom)
  const refreshKey = useAtomValue(refreshLabelListAtom)

  const { data, isLoading, error, mutate } = useFrappeGetCall('raven.api.user_label.get_my_labels', { lazy: true })
  const { title } = useSidebarMode()

  useEffect(() => {
    if (visible && labelList.length === 0) mutate()
  }, [visible])

  useEffect(() => {
    if (data?.message) {
      setLabelList(data.message)
    }
  }, [data])

  useEffect(() => {
    if (refreshKey > 0) mutate()
  }, [refreshKey])

  if (!visible) return null
  if (isLoading && labelList.length === 0) return <div className='text-sm text-gray-500 px-3'>Đang tải...</div>
  if (error && labelList.length === 0) return <div className='text-sm text-red-500 px-3'>Lỗi tải nhãn</div>

  return (
    <ul className='mt-1 space-y-1'>
      {labelList.map((item, i) => (
        <li
          key={item.label_id}
          onClick={() => onClickLabel(item.label)}
          className={clsx(
            'flex items-center pl-5 gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-2',
            title === item.label && 'bg-gray-3 font-semibold'
          )}
        >
          <MdLabelOutline className='w-4 h-4 text-gray-11 shrink-0' />
          <span className='truncate'>{item.label}</span>
        </li>
      ))}
    </ul>
  )
}
