import { Text, Button, HStack, StackDivider, useColorMode } from "@chakra-ui/react"
import { DateTooltip } from "./DateTooltip"
import { ModalTypes, useModalManager } from "@/hooks/useModalManager"
import { UserProfileDrawer } from "../../user-details/UserProfileDrawer"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { UserFields } from "@/utils/users/UserListProvider"

interface UserNameInMessageProps {
    timestamp: string,
    user: string,
}

export const UserNameInMessage = ({ timestamp, user }: UserNameInMessageProps) => {

    const { colorMode } = useColorMode()
    const textColor = colorMode === 'light' ? 'gray.800' : 'gray.50'

    const modalManager = useModalManager()

    const onOpenUserDetailsDrawer = (selectedUser: UserFields) => {
        if (selectedUser) {
            modalManager.openModal(ModalTypes.UserDetails, selectedUser)
        }
    }

    const users = useGetUserRecords()

    return (
        <>
            <HStack divider={<StackDivider />} align='flex-start'>
                <Button variant='link' onClick={() => onOpenUserDetailsDrawer?.(users?.[user])}>
                    <Text fontSize='sm' lineHeight={'0.9'} fontWeight="semibold" as='span' color={textColor}>{users?.[user]?.full_name ?? user}</Text>
                </Button>
                <DateTooltip timestamp={timestamp} />
            </HStack>
            <UserProfileDrawer
                isOpen={modalManager.modalType === ModalTypes.UserDetails}
                onClose={modalManager.closeModal}
                user={modalManager.modalContent}
            />
        </>
    )
}