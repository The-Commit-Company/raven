import { EmailIcon } from "@chakra-ui/icons"
import { Text, Avatar, Divider, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Stack, HStack, IconButton, Button, Icon, useColorMode } from "@chakra-ui/react"
import { BiMessage } from "react-icons/bi"
import { BsFillCircleFill } from "react-icons/bs"
import { User } from "../../../types/User/User"

interface UserProfileDrawerProps {
    isOpen: boolean
    onClose: () => void,
    user: User
}

export const UserProfileDrawer = ({ isOpen, onClose, user }: UserProfileDrawerProps) => {

    const { colorMode } = useColorMode()
    const textColor = colorMode === 'light' ? 'blue.500' : 'blue.300'

    return (
        <Drawer
            isOpen={isOpen}
            placement='right'
            onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent>

                <DrawerCloseButton mt='2' />
                <DrawerHeader borderBottomWidth='1px'>Profile</DrawerHeader>

                <DrawerBody>
                    <Stack spacing={6} mt='4'>
                        <Avatar size='3xl' borderRadius={'md'} src={user.user_image} />
                        <HStack justifyContent='space-between'>
                            <Text fontSize='xl' fontWeight='bold'>{user.full_name}</Text>
                            <HStack spacing={1}>
                                <Icon as={BsFillCircleFill} color='green.500' h='10px' />
                                <Text fontWeight='normal'>Active</Text>
                            </HStack>
                        </HStack>
                        <Button variant='outline' colorScheme='blue' leftIcon={<BiMessage />} onClick={() => console.log("message user")}>
                            Message
                        </Button>
                        <Divider />
                        <Stack spacing={4}>
                            <Text fontWeight='semibold'>Contact Information</Text>
                            <HStack>
                                <IconButton aria-label='Email' icon={<EmailIcon />} />
                                <Stack spacing={0}>
                                    <Text fontSize='sm' fontWeight='medium'>Email Address</Text>
                                    <Text fontSize='sm' color={textColor}>{user.name}</Text>
                                </Stack>
                            </HStack>
                        </Stack>
                    </Stack>
                </DrawerBody>

            </DrawerContent>
        </Drawer>
    )
}