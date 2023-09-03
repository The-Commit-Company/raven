import { Text, Button, HStack, StackDivider, useColorMode } from "@chakra-ui/react"
import { DateTooltip } from "./DateTooltip"
import { ChannelMembers, Member } from "@/pages/ChatSpace"
import { ModalTypes, useModalManager } from "@/hooks/useModalManager"
import { UserProfileDrawer } from "../../user-details/UserProfileDrawer"

interface UserNameInMessageProps {
    timestamp: Date,
    user: string,
    channelMembers: ChannelMembers
}

export const UserNameInMessage = ({ timestamp, user, channelMembers }: UserNameInMessageProps) => {

    const { colorMode } = useColorMode()
    const textColor = colorMode === 'light' ? 'gray.800' : 'gray.50'

    const modalManager = useModalManager()

    const onOpenUserDetailsDrawer = (selectedUser: Member) => {
        if (selectedUser) {
            modalManager.openModal(ModalTypes.UserDetails, selectedUser)
        }
    }

    return (
        <>
            <HStack divider={<StackDivider />} align='flex-start'>
                <Button variant='link' onClick={() => onOpenUserDetailsDrawer?.(channelMembers?.[user])}>
                    <Text fontSize='sm' lineHeight={'0.9'} fontWeight="semibold" as='span' color={textColor}>{channelMembers?.[user]?.full_name ?? user}</Text>
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