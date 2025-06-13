// ==== labels/conversation/CreateConversationContent.tsx ====
import { useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import { Dialog, Flex, Button, Checkbox } from '@radix-ui/themes'
import { IoMdClose } from 'react-icons/io'
import { sortedChannelsAtom } from '@/utils/channel/ChannelAtom'
import ChannelItem from './ChannelItem'
import SelectedChannelItem from './SelectedChannelItem'

type Props = {
  setIsOpen: (v: boolean) => void
  label: string
}

const CreateConversationContent = ({ setIsOpen, label }: Props) => {
  const channels = useAtomValue(sortedChannelsAtom)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  const handleToggle = (channelID: string) => {
    setSelected((prev) => {
      const newSet = new Set(prev)
      newSet.has(channelID) ? newSet.delete(channelID) : newSet.add(channelID)
      return newSet
    })
  }

  const selectedChannels = useMemo(() => channels.filter((c) => selected.has(c.name)), [selected, channels])

  const filteredChannels = useMemo(() => {
    const keyword = search.toLowerCase()
    return channels.filter(
      (channel) =>
        channel.is_self_message !== 1 &&
        (channel.channel_name?.toLowerCase().includes(keyword) || channel.name.toLowerCase().includes(keyword))
    )
  }, [channels, search])

  return (
    <form className='space-y-4'>
      <Dialog.Title className='text-lg font-semibold flex w-full items-center justify-between'>
        <Flex align='center' gap='2'>
          Thêm cuộc trò chuyện vào <span className='italic'>"{label}"</span>
        </Flex>
        <Dialog.Close>
          <IoMdClose
            type='button'
            className='cursor-pointer text-gray-500 hover:text-black dark:hover:text-white transition-colors p-1 ml-auto'
            aria-label='Đóng'
          />
        </Dialog.Close>
      </Dialog.Title>

      <div className='flex gap-4 border rounded' style={{ height: '400px' }}>
        {/* Left column */}
        <div className='w-1/2 border-r p-2 flex flex-col'>
          <input
            type='text'
            placeholder='Tìm kiếm'
            className='w-90 p-2 border rounded text-sm mb-2'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className='flex-1 overflow-y-auto space-y-1'>
            {filteredChannels.map((channel) => (
              <ChannelItem key={channel.name} channel={channel} selected={selected} handleToggle={handleToggle} />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className='w-1/2 p-2 text-sm'>
          <div className='mb-2 font-medium'>Đã chọn: {selected.size} cuộc trò chuyện</div>
          <div className='space-y-1'>
            {selectedChannels.map((channel) => (
              <SelectedChannelItem key={channel.name} channel={channel} handleToggle={handleToggle} />
            ))}
            {selectedChannels.length === 0 && <div className='text-gray-500 italic'>Chưa chọn cuộc trò chuyện nào</div>}
          </div>
        </div>
      </div>

      <Flex justify='between' align='center' pt='2'>
        <Dialog.Close>
          <Button className='cursor-pointer' variant='ghost' type='button' size='2'>
            Hủy bỏ
          </Button>
        </Dialog.Close>
        <Button className='cursor-pointer' type='submit' size='2' disabled={selected.size === 0}>
          Thêm
        </Button>
      </Flex>
    </form>
  )
}

export { CreateConversationContent }
