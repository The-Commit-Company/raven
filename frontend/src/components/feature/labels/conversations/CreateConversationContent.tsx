// ==== labels/conversation/CreateConversationContent.tsx ====

import { Button, Dialog, Flex } from '@radix-ui/themes'
import { useAtomValue, useSetAtom } from 'jotai'
import { lazy, Suspense, useContext, useMemo, useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { toast } from 'sonner'

import { sortedChannelsAtom, useUpdateChannelLabels } from '@/utils/channel/ChannelAtom'
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { refreshLabelListAtom } from './atoms/labelAtom'

import { useIsMobile } from '@/hooks/useMediaQuery'
import clsx from 'clsx'
import { UnifiedChannel } from '../../direct-messages/useUnifiedChannelList'
import ChannelModalConversationItem from './ChannelModalConversationItem'
import SelectedChannelItem from './SelectedChannelItem'
import { useSidebarMode } from '@/utils/layout/sidebar'
import { UserListContext } from '@/utils/users/UserListProvider'

type Props = {
  setIsOpen: (v: boolean) => void
  label: string // label_id, ví dụ: 'ULB0001'
  name: string
  channels: any[]
}

const ChannelDetailDialog = lazy(() => import('./ChannelDetailDialog'))

const CreateConversationContent = ({ name, setIsOpen, label }: Props) => {
  const channels = useAtomValue(sortedChannelsAtom)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [currentChannel, setCurrentChannel] = useState<UnifiedChannel | null>(null)

  const { call, loading } = useFrappePostCall('raven.api.user_channel_label.add_label_to_multiple_channels')
  const { addLabelToChannel } = useUpdateChannelLabels()

  const setRefreshKey = useSetAtom(refreshLabelListAtom)

  const handleOpenModal = (channel: UnifiedChannel) => {
    setCurrentChannel(channel)
  }

  const handleToggle = (channelID: string) => {
    setSelected((prev) => {
      const newSet = new Set(prev)
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      newSet.has(channelID) ? newSet.delete(channelID) : newSet.add(channelID)
      return newSet
    })
  }
  const isMobile = useIsMobile()

  const selectedChannels = useMemo(() => channels.filter((c) => selected.has(c.name)), [selected, channels])

  const { enabledUsers: users } = useContext(UserListContext)

  const userMap = useMemo(() => {
    const map = new Map<string, string>()
    users?.forEach((user) => {
      map.set(user.name, user.full_name || '')
    })
    return map
  }, [users])

  const normalizeText = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .trim()
      .toLowerCase()

  const filteredChannels = useMemo(() => {
    if (!search) {
      return channels.filter((channel) => channel.is_self_message !== 1)
    }

    const keyword = normalizeText(search)

    return channels.filter((channel) => {
      if (channel.is_self_message === 1) return false

      if (channel.is_direct_message === 1) {
        const peerName = normalizeText(userMap.get(channel.peer_user_id) || '')
        return peerName.includes(keyword)
      }

      const channelName = normalizeText(channel.channel_name || '')
      return channelName.includes(keyword)
    })
  }, [channels, search, userMap])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const channel_ids = Array.from(selected)

    try {
      await call({
        label_id: name,
        channel_ids: JSON.stringify(channel_ids)
      })

      // ✅ Cập nhật local sortedChannelsAtom
      channel_ids?.forEach((channelID) => {
        addLabelToChannel(channelID, { label_id: name, label })
      })

      // ✅ Cập nhật key để trigger re-render các nơi khác
      setRefreshKey((prev) => prev + 1)

      // mutate('channel_list')

      setIsOpen(false)
      toast.success('Gán nhãn thành công')
    } catch (err) {
      console.error('Error adding label:', err)
      const errorMessage = (err as any)?.message?.message || 'Đã có lỗi xảy ra'
      toast.error(errorMessage)
    }
  }

  return (
    <>
      <form className='space-y-4 overflow-hidden' onSubmit={handleSubmit}>
        <Dialog.Title className='text-lg font-semibold flex w-full items-center justify-between'>
          <Flex align='center' gap='2' className='flex-wrap'>
            <span>Thêm cuộc trò chuyện vào</span>
            <span className='italic'>{label}</span>
          </Flex>

          <Dialog.Close>
            <IoMdClose
              type='button'
              className='cursor-pointer text-gray-500 hover:text-black dark:hover:text-white transition-colors p-1 ml-auto'
              aria-label='Đóng'
            />
          </Dialog.Close>
        </Dialog.Title>

        <div
          className='flex flex-col md:flex-row gap-4 border rounded dark:border-gray-700'
          style={{ height: '400px' }}
        >
          {/* Left column */}
          <div
            className={clsx(
              'md:w-1/2 border-b md:border-b-0 md:border-r dark:border-gray-700 p-2 flex flex-col order-2 md:order-none',
              isMobile && 'overflow-x-hidden'
            )}
          >
            <input
              type='text'
              placeholder='Tìm kiếm'
              className='w-80 p-2 border rounded text-sm mb-2
        border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary
        dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:placeholder-gray-500'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className='flex-1 overflow-y-auto space-y-1'>
              {filteredChannels?.map((channel) => (
                <ChannelModalConversationItem
                  key={channel.name}
                  channel={channel}
                  selected={selected}
                  handleToggle={handleToggle}
                  name={name}
                  onOpenModal={handleOpenModal}
                />
              ))}

              {filteredChannels.length === 0 && (
                <div className='text-gray-500 italic p-2'>
                  Không có cuộc trò chuyện nào tên là: "<strong>{search}</strong>"
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className={clsx('md:w-1/2 p-2 text-sm order-1 md:order-none', !isMobile && 'overflow-x-hidden')}>
            <div className='mb-2 font-medium'>Đã chọn: {selected.size} cuộc trò chuyện</div>
            <div className={`${isMobile ? 'flex flex-wrap mt-5 gap-4' : 'space-y-1'}`}>
              {selectedChannels?.map((channel) => (
                <SelectedChannelItem key={channel.name} channel={channel} handleToggle={handleToggle} />
              ))}
              {selectedChannels?.length === 0 && (
                <div className='text-gray-500 italic'>Chưa chọn cuộc trò chuyện nào</div>
              )}
            </div>
          </div>
        </div>

        <Flex align='center' justify='end' gap='3'>
          <Dialog.Close>
            <Button type='button' variant='soft' size='2' className='cursor-pointer' disabled={loading}>
              Hủy
            </Button>
          </Dialog.Close>

          <Button type='submit' size='2' className='cursor-pointer' disabled={loading}>
            {loading ? 'Đang thêm...' : 'Thêm'}
          </Button>
        </Flex>
      </form>

      <Suspense fallback={null}>
        <ChannelDetailDialog channel={currentChannel} onClose={() => setCurrentChannel(null)} />
      </Suspense>
    </>
  )
}

export { CreateConversationContent }
