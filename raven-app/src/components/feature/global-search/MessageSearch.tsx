import { Button, HStack, Select, TabPanel } from '@chakra-ui/react'
import { EmptyStateForSearch } from '../../layout/EmptyState/EmptyState'

interface Props {
    onToggleMyChannels: () => void,
    isOpenMyChannels: boolean,
}

export const MessageSearch = ({ onToggleMyChannels, isOpenMyChannels }: Props) => {
    return (
        <TabPanel px={0}>
            <HStack pl={4}>
                <Select placeholder="From" size='sm' w="5rem">
                    <option value="any">Any channel type</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="open">Open</option>
                </Select>
                <Select placeholder="In" size='sm' w="5rem">
                    <option value="any">Any channel type</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="open">Open</option>
                </Select>
                <Select placeholder="With" size='sm' w="5rem">
                    <option value="any">Any channel type</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="open">Open</option>
                </Select>
                <Select placeholder="Date" size='sm' w="5rem">
                    <option value="any">Any channel type</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="open">Open</option>
                </Select>
                <Button onClick={onToggleMyChannels} isActive={isOpenMyChannels} size='sm' w="9rem">Only my channels</Button>
                <Button variant="link" size='sm' >More filters</Button>
            </HStack>
            <EmptyStateForSearch />
        </TabPanel>
    )
}