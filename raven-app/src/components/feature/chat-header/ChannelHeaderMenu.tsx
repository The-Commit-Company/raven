import { useBoolean } from '@/hooks/useBoolean'
import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes'
import { BiCog, BiDotsHorizontal, BiFile, BiFolder, BiInfoCircle, BiSearch, BiUserPlus } from 'react-icons/bi'
import { ViewFilesButton } from '../files/ViewFilesButton'
import AddChannelMembersModal from '../channel-member-details/add-members/AddChannelMembersModal'
type Props = {}

const ICON_SIZE = '18'

const ChannelHeaderMenu = (props: Props) => {

    const [isFileOpen, { on: onFileOpen }, onFileChange] = useBoolean(false)
    const [isAddMembersOpen, { on: onAddMembersOpen }, onAddMembersChange] = useBoolean(false)

    return (
        <><DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <IconButton color='gray' className='bg-transparent text-gray-11 hover:bg-gray-3'>
                    <BiDotsHorizontal />
                </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item>
                    <Flex gap='2' align='center'>
                        <BiSearch size={ICON_SIZE} />
                        Search
                    </Flex>
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={onFileOpen}>
                    <Flex gap='2' align='center'>
                        <BiFile size={ICON_SIZE} />
                        View Files
                    </Flex>
                </DropdownMenu.Item>
                {/* <DropdownMenu.Item>
                    <Flex gap='2' align='center'>
                        <BiFolder size={ICON_SIZE} />
                        View Documents
                    </Flex>
                </DropdownMenu.Item> */}
                <DropdownMenu.Separator />
                <DropdownMenu.Item onClick={onAddMembersOpen}>
                    <Flex gap='2' align='center'>
                        <BiUserPlus size={ICON_SIZE} />
                        Add Members
                    </Flex>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                    <Flex gap='2' align='center'>
                        <BiCog size={ICON_SIZE} />
                        Channel Settings
                    </Flex>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
            <ViewFilesButton open={isFileOpen} setOpen={onFileChange} />
            <AddChannelMembersModal open={isAddMembersOpen} setOpen={onAddMembersChange} />
        </>
    )
}

export default ChannelHeaderMenu