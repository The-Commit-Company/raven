import { Button, Dialog, Flex, Select, TextField } from '@radix-ui/themes'
import { BiSolidCircle } from 'react-icons/bi'
import { FaCircleDot, FaCircleMinus } from 'react-icons/fa6'
import { MdWatchLater } from 'react-icons/md'

const SetCustomStatusContent = ({ onClose }: { onClose: VoidFunction }) => {

    return (
        <div>
            <Dialog.Title>Set a custom status</Dialog.Title>
            <Dialog.Description size="2" mb="4">
                Set a custom status to share what you're up to
            </Dialog.Description>

            <Flex direction="column" gap="3">
                <TextField.Root>
                    <TextField.Input id="name" maxLength={140}
                        required
                        autoFocus
                        placeholder='e.g. Out of Office'
                    />
                </TextField.Root>
                <Select.Root defaultValue="Online">
                    <Select.Trigger />
                    <Select.Content>
                        <Select.Item value='Online'>
                            <Flex gap={'2'} align={'center'}><BiSolidCircle color={'green'} fontSize={'0.8rem'} /> Online</Flex>
                        </Select.Item>
                        <Select.Item value='Idle'>
                            <Flex gap={'2'} align={'center'}><MdWatchLater className={'text-amber-400'} fontSize={'0.75rem'} /> Idle</Flex>
                        </Select.Item>
                        <Select.Item value='Do not disturb'>
                            <Flex gap={'2'} align={'center'}><FaCircleMinus className={'text-red-600'} fontSize={'0.6rem'} /> Do not disturb</Flex>
                        </Select.Item>
                        <Select.Item value='Invisible'>
                            <Flex gap={'2'} align={'center'}><FaCircleDot className={'text-gray-400'} fontSize={'0.6rem'} /> Invisible</Flex>
                        </Select.Item>
                    </Select.Content>
                </Select.Root>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                    <Button variant="soft" color="gray">
                        Cancel
                    </Button>
                </Dialog.Close>
                <Dialog.Close>
                    <Button>Save</Button>
                </Dialog.Close>
            </Flex>
        </div>
    )
}

export default SetCustomStatusContent