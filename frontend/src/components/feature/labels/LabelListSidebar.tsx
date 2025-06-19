import { MdLabelOutline } from 'react-icons/md'
import clsx from 'clsx'
import { useEffect, useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'

import { useSidebarMode } from '@/utils/layout/sidebar'
import { labelListAtom, refreshLabelListAtom } from './conversations/atoms/labelAtom'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useEnrichedChannels } from '@/utils/channel/ChannelAtom'

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

  const enrichedChannels = useEnrichedChannels()

  const labelUnreadMap = useMemo(() => {
    const map = new Map<string, number>()

    for (const ch of enrichedChannels) {
      if (Array.isArray(ch.user_labels)) {
        ch.user_labels.forEach((labelId) => {
          const prev = map.get(labelId) ?? 0
          map.set(labelId, prev + (ch.unread_count ?? 0))
        })
      }
    }

    return map
  }, [enrichedChannels])

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
      {labelList?.map((item) => {
        const unread = labelUnreadMap.get(item.label_id) ?? 0

        return (
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
            <div className='flex justify-between items-center w-full'>
              <span className='truncate'>{item.label}</span>
              {unread > 0 && (
                <span className='ml-auto bg-red-500 text-white text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center'>
                  {unread > 10 ? '9+' : unread}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
