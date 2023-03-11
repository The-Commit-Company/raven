import { Box, Button, ButtonGroup, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, RadioProps, Stack, useColorMode, useRadio, useRadioGroup } from "@chakra-ui/react"

interface SetUserStatusProps {
    isOpen: boolean,
    onClose: () => void
}

export const SetUserStatus = ({ isOpen, onClose }: SetUserStatusProps) => {

    const options = [
        '✅ Available',
        '🤫 Do Not Disturb',
        '🗓️ In a Meeting',
        '🧋 Out of Office',
        '🤒 Out Sick',
        '🌴 On Vacation',
        '🚌 Commuting',
        '🏡 Working Remotely'
    ]

    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'user-status',
        defaultValue: '✅ Available',
        onChange: (value) => console.log(value),
    })

    const group = getRootProps()

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Set a status</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <Stack {...group} spacing={1}>
                        {options.map((value) => {
                            const radio = getRadioProps({ value })
                            return (
                                <RadioCard key={value} {...radio}>
                                    {value}
                                </RadioCard>
                            )
                        })}
                    </Stack>
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        <Button variant='ghost' onClick={onClose}>Cancel</Button>
                        <Button colorScheme="blue">Save</Button>
                    </ButtonGroup>
                </ModalFooter>

            </ModalContent>
        </Modal>
    )
}

export const RadioCard = (props: RadioProps) => {

    const { getInputProps, getCheckboxProps } = useRadio(props)
    const input = getInputProps()
    const checkbox = getCheckboxProps()
    const { colorMode } = useColorMode()

    return (
        <Box as='label'>
            <input {...input} />
            <Box
                {...checkbox}
                borderRadius='md'
                cursor='pointer'
                _checked={{
                    border: '2px solid',
                    borderColor: 'blue.500',
                }}
                _hover={{
                    bg: colorMode === 'light' ? 'gray.100' : 'gray.600',
                    color: colorMode === 'light' ? 'gray.900' : 'white',
                }}
                px={5}
                py={2}>
                {props.children}
            </Box>
        </Box>
    )
}