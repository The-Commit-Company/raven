import { useState } from 'react'
import { Badge, Dialog, Flex, Text, Button } from '@radix-ui/themes'
import { useUpdateChannelLabels } from '@/utils/channel/ChannelAtom'
import { useSWRConfig } from 'swr'
import { toast } from 'sonner'
import { useSetAtom } from 'jotai'
import { useRemoveChannelFromLabel } from '@/hooks/useRemoveChannelFromLabel'
import { refreshLabelListAtom } from '../labels/conversations/atoms/labelAtom'

const ChannelLabelBadge = ({
  channelID,
  labelID,
  labelName,
  onRemoveLocally
}: {
  channelID: string
  labelID: string
  labelName: string
  onRemoveLocally?: (channelID: string) => void
}) => {
  const { removeChannel, loading: isLoading } = useRemoveChannelFromLabel()
  const { updateChannelLabels } = useUpdateChannelLabels()
  const { mutate } = useSWRConfig()
  const setRefreshKey = useSetAtom(refreshLabelListAtom)

  const [isHovered, setIsHovered] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleClickRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowModal(true)
  }

  const handleConfirmRemove = async () => {
    try {
      await removeChannel(labelID, channelID)

      onRemoveLocally?.(channelID)
      updateChannelLabels(channelID, (prevLabels) => prevLabels.filter((l) => l.label_id !== labelID))
      setRefreshKey((prev) => prev + 1)

      toast.success(`Đã xoá thành công`)
      setShowModal(false)
      mutate('channel_list')
    } catch (err) {
      console.error('Xoá thất bại:', err)
      toast.error('Xoá channel khỏi nhãn thất bại')
    }
  }

  return (
    <>
      <div
        className='relative inline-block mr-1'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Badge
          color='blue'
          variant='soft'
          className='font-medium px-2.5 py-0.5 text-xs dark:bg-[#003d3d] text-[#00e0e0] rounded pr-5 inline-flex items-center'
        >
          {labelName}
        </Badge>
        {isHovered && (
          <button
            onClick={handleClickRemove}
            className='absolute top-1/2 right-0 translate-y-[-50%] translate-x-[10%] w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer text-black bg-transparent'
          >
            ✕
          </button>
        )}
      </div>

      <Dialog.Root open={showModal} onOpenChange={setShowModal}>
        <Dialog.Content className='max-w-md bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg z-[300]'>
          <Dialog.Title>Xác nhận xoá</Dialog.Title>
          <Text as='p' size='3' className='mb-4'>
            Bạn có chắc muốn xoá nhãn <strong>{labelName}</strong> khỏi kênh này không?
          </Text>
          <Flex justify='end' gap='3'>
            <Button className='cursor-pointer' variant='soft' onClick={() => setShowModal(false)}>
              Huỷ
            </Button>
            <Button className='cursor-pointer' color='red' onClick={handleConfirmRemove} disabled={isLoading}>
              {isLoading ? 'Đang xoá...' : 'Xoá'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}

export default ChannelLabelBadge
