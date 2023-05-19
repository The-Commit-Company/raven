import { EmailIcon } from "@chakra-ui/icons"
import { Text, Avatar, Divider, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Stack, HStack, IconButton, Button, Icon, useColorMode, useDisclosure } from "@chakra-ui/react"
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk"
import { useContext } from "react"
import { BiMessage } from "react-icons/bi"
import { BsFillCircleFill, BsCircle, BsClock } from "react-icons/bs"
import { useNavigate } from "react-router-dom"
import { User } from "../../../types/User/User"
import { DateObjectToTimeString } from "../../../utils/operations"
import { AlertBanner } from "../../layout/AlertBanner"
import { UserDataContext } from "../../../utils/user/UserDataProvider"
import { AiOutlineEdit } from "react-icons/ai"
import { SetUserStatus } from "./SetUserStatus"

interface UserProfileDrawerProps {
    isOpen: boolean
    onClose: () => void,
    user: User
}

export const UserProfileDrawer = ({ isOpen, onClose, user }: UserProfileDrawerProps) => {

    const { colorMode } = useColorMode()
    const textColor = colorMode === 'light' ? 'blue.500' : 'blue.300'

    const navigate = useNavigate()
    const { call, error: channelError, loading, reset } = useFrappePostCall<{ message: string }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.create_direct_message_channel")
    const { data: activeUsers, error: activeUsersError } = useFrappeGetCall<{ message: string[] }>('raven.api.user_availability.get_active_users')

    const gotoDMChannel = async (user: string) => {
        reset()
        const result = await call({ user_id: user })
        navigate(`/channel/${result?.message}`)
    }

    if (channelError) {
        <AlertBanner status="error" heading={channelError.message}>{channelError.httpStatus} - {channelError.httpStatusText}</AlertBanner>
    }

    const userData = useContext(UserDataContext)
    const { isOpen: isSetUserStatusModalOpen, onOpen: onSetUserStatusModalOpen, onClose: onSetUserStatusModalClose } = useDisclosure()

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
                        {user && <Avatar size='3xl' borderRadius={'md'} src={user.user_image} />}
                        <Stack>
                            <HStack justifyContent='space-between'>
                                {user && <Text fontSize='xl' fontWeight='bold'>{user.full_name}</Text>}
                                {user && (activeUsers?.message.includes(user.name) && !!!activeUsersError) ? <HStack spacing={1}>
                                    <Icon as={BsFillCircleFill} color='green.500' h='10px' />
                                    <Text fontWeight='normal'>Active</Text>
                                </HStack> :
                                    <HStack spacing={1}>
                                        <Icon as={BsCircle} h='10px' />
                                        <Text fontWeight='normal'>Away</Text>
                                    </HStack>}
                            </HStack>
                            <HStack spacing={1}>
                                <Icon as={BsClock} />
                                <Text fontWeight='normal' fontSize={15}>{DateObjectToTimeString(new Date())} local time</Text>
                            </HStack>
                        </Stack>

                        {user && userData && (user.name !== userData?.name)
                            ?
                            <Button variant='outline'
                                colorScheme='blue'
                                leftIcon={<BiMessage />}
                                onClick={() => {
                                    gotoDMChannel(user.name)
                                    onClose()
                                }}
                                isLoading={loading}>
                                Message
                            </Button>
                            :
                            <Button variant='outline'
                                colorScheme='blue'
                                leftIcon={<AiOutlineEdit />}
                                onClick={onSetUserStatusModalOpen}>
                                Set Status
                            </Button>
                        }

                        <Divider />
                        <Stack spacing={4}>
                            <Text fontWeight='semibold'>Contact Information</Text>
                            <HStack>
                                <IconButton aria-label='Email' icon={<EmailIcon />} cursor='initial' />
                                <Stack spacing={0}>
                                    <Text fontSize='sm' fontWeight='medium'>Email Address</Text>
                                    {user && <Text fontSize='sm' color={textColor}>{user.name}</Text>}
                                </Stack>
                            </HStack>
                        </Stack>
                    </Stack>
                </DrawerBody>
                <SetUserStatus isOpen={isSetUserStatusModalOpen} onClose={onSetUserStatusModalClose} />
            </DrawerContent>
        </Drawer>
    )
}