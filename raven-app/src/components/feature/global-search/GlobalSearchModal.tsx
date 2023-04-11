import { SearchIcon } from "@chakra-ui/icons"
import { Button, HStack, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Stack, Text } from "@chakra-ui/react"
import { useSearch } from "frappe-react-sdk"
import { ChangeEvent, useState } from "react"
import { TbMessages, TbFiles, TbHash, TbUsers } from "react-icons/tb"
import { useDebounce } from "../../../hooks/useDebounce"

interface GlobalSearchModalProps {
    isOpen: boolean,
    onClose: () => void,
}

export const GlobalSearchModal = ({ isOpen, onClose }: GlobalSearchModalProps) => {
    const [searchText, setSearchText] = useState("")
    const debouncedText = useDebounce(searchText, 200)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value)
    }

    const { data, isValidating } = useSearch("Message", debouncedText, [["channel_id", "=", "general"]])

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='lg'>
            <ModalOverlay />
            <ModalContent>
                <InputGroup size='md' width='full'>
                    <InputLeftElement
                        pointerEvents='none'
                        children={<SearchIcon color='gray.300' />} />
                    <Input
                        onChange={handleChange}
                        roundedTop='md'
                        roundedBottom={debouncedText.length > 0 ? 'none' : 'md'}
                        type='text'
                        placeholder='Search messages, files, people, etc.' />
                </InputGroup>
                {debouncedText.length > 0 && <Stack padding={4}>
                    {debouncedText.length <= 2 && <Text fontSize='xs' color='gray.500'>Continue typing...</Text>}
                    {debouncedText.length > 2 &&
                        <><Text fontSize='xs' color='gray.500'>I'm looking for...</Text><HStack spacing={3}>
                            <Button size='sm' colorScheme='gray' leftIcon={<TbMessages />}>Messages</Button>
                            <Button size='sm' colorScheme='gray' leftIcon={<TbFiles />}>Files</Button>
                            <Button size='sm' colorScheme='gray' leftIcon={<TbHash />}>Channels</Button>
                            <Button size='sm' colorScheme='gray' leftIcon={<TbUsers />}>People</Button>
                        </HStack></>
                    }
                </Stack>}
            </ModalContent>
        </Modal>
    )
}