import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes'
import { BiPlus } from 'react-icons/bi'
import { RightToolbarButtonsProps } from '../RightToolbarButtons'
import { MdOutlineBarChart } from 'react-icons/md'
import { HiOutlineGif } from 'react-icons/hi2'
import AttachFile from './AttachFile'
import { useBoolean } from '@/hooks/useBoolean'
import CreatePollDrawer from './CreatePollDrawer'
import AddGIFDrawer from './AddGIFDrawer'

const MobileInputActions = ({ fileProps, channelID }: RightToolbarButtonsProps) => {

    const [isPollOpen, { on: onPollOpen }, setIsPollOpen] = useBoolean()
    const [isGIFPickerOpen, { on: onGIFPickerOpen }, setIsGIFPickerOpen] = useBoolean()
    return (
        <>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <IconButton radius='full' color='gray' variant='soft' size='2' className='mb-1'>
                        <BiPlus size='20' />
                    </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className='min-w-48' size='2'>
                    <DropdownMenu.Item onClick={onPollOpen} className='text-base !h-10'>
                        <Flex gap='2' className='items-center'>
                            <MdOutlineBarChart />
                            Poll
                        </Flex>
                    </DropdownMenu.Item>
                    {fileProps && <AttachFile fileProps={fileProps} />}
                    <DropdownMenu.Item onClick={onGIFPickerOpen} className='text-base !h-10'>
                        <Flex gap='2' className='items-center'>
                            <HiOutlineGif />
                            GIF
                        </Flex>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
            {channelID && <CreatePollDrawer isOpen={isPollOpen} setIsOpen={setIsPollOpen} channelID={channelID} />}
            <AddGIFDrawer isOpen={isGIFPickerOpen} setIsOpen={setIsGIFPickerOpen} />
        </>
    )
}

export default MobileInputActions