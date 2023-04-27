import { SearchIcon } from '@chakra-ui/icons'
import { Button, HStack, Input, InputGroup, InputLeftElement, Select, Stack, TabPanel } from '@chakra-ui/react'
import { useState } from 'react'
import { useDebounce } from '../../../hooks/useDebounce'
import { EmptyStateForSearch } from '../../layout/EmptyState/EmptyState'

interface Props {
    onToggleMyChannels: () => void,
    isOpenMyChannels: boolean,
}

export const FileSearch = ({ onToggleMyChannels, isOpenMyChannels }: Props) => {
    const [searchText, setSearchText] = useState("")
    const debouncedText = useDebounce(searchText, 50)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }
    return (
        <TabPanel px={0}>
            <Stack p={4}>
                <InputGroup>
                    <InputLeftElement
                        pointerEvents='none'
                        children={<SearchIcon color='gray.300' />} />
                    <Input
                        autoFocus
                        onChange={handleChange}
                        type='text'
                        placeholder='Search by file name or keyword'
                        value={debouncedText} />
                </InputGroup>
                <HStack>
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
                    <Select placeholder="Date" size='sm' w="5rem">
                        <option value="any">Any channel type</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="open">Open</option>
                    </Select>
                    <Select placeholder="File type" size='sm' w="7rem">
                        <option value="any">Any channel type</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="open">Open</option>
                    </Select>
                    <Button onClick={onToggleMyChannels} isActive={isOpenMyChannels} size='sm' w="9rem">Only my channels</Button>
                    <Button variant="link" size='sm' >More filters</Button>
                </HStack>
            </Stack>
            <EmptyStateForSearch />
        </TabPanel>
    )
}