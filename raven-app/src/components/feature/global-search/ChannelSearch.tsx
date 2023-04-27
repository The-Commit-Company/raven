import { Button, HStack, Select, TabPanel } from '@chakra-ui/react'
import { EmptyStateForSearch } from '../../layout/EmptyState/EmptyState'

interface Props {
    onToggleMyChannels: () => void,
    isOpenMyChannels: boolean,
    onToggleOtherChannels: () => void,
    isOpenOtherChannels: boolean,
}

export const ChannelSearch = ({ onToggleMyChannels, isOpenMyChannels, onToggleOtherChannels, isOpenOtherChannels }: Props) => {
    return (
        <TabPanel px={0}>
            <HStack pl={4}>
                <Select placeholder="Channel type" size='sm' w="9rem">
                    <option value="any">Any channel type</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="open">Open</option>
                </Select>
                <Button onClick={onToggleOtherChannels} isActive={isOpenOtherChannels} size='sm' w="15rem">Exclude the channels that I'm in</Button>
                <Button onClick={onToggleMyChannels} isActive={isOpenMyChannels} size='sm' w="9rem">Only my channels</Button>
            </HStack>
            <EmptyStateForSearch />
        </TabPanel>
    )
}