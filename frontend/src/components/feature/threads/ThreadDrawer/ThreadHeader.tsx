import { useNavigate, useParams } from "react-router-dom"
import { DropdownMenu, Flex, Heading, IconButton } from "@radix-ui/themes"
import { BiDotsVerticalRounded, BiExit } from "react-icons/bi"
import { useContext } from "react"
import { UserContext } from "@/utils/auth/UserProvider"
import { useFrappeDeleteDoc, useFrappeGetCall } from "frappe-react-sdk"
import { toast } from "sonner"
import { getErrorMessage } from "@/components/layout/AlertBanner/ErrorBanner"
import { AiOutlineClose } from "react-icons/ai"

export const ThreadHeader = () => {

    const navigate = useNavigate()

    return (
        <header className='dark:bg-gray-2 bg-white fixed top-0 px-3 sm:w-[calc((100vw-var(--sidebar-width)-var(--space-8))/2)] w-screen' style={{ zIndex: 999 }}>
            <Flex direction={'column'} gap='2' className='py-3 border-gray-4 sm:dark:border-gray-6 border-b'>
                <Flex justify={'between'} align={'center'}>
                    <Heading size='4' className='pl-1'>Thread</Heading>
                    <Flex gap='2' justify={'between'} align={'center'}>
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                                <IconButton color='gray' className='bg-transparent text-gray-12 hover:bg-gray-3'>
                                    <BiDotsVerticalRounded />
                                </IconButton>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content className='min-w-48'>
                                <LeaveThreadButton />
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                        <IconButton
                            className='mr-1 text-gray-11'
                            variant="ghost"
                            color="gray"
                            aria-label="Close thread"
                            title="Close thread"
                            onClick={() => navigate('../')}>
                            <AiOutlineClose size='16' />
                        </IconButton>
                    </Flex>
                </Flex>
            </Flex>
        </header>
    )
}


const LeaveThreadButton = () => {

    const { threadID } = useParams()
    const { currentUser } = useContext(UserContext)
    const { deleteDoc } = useFrappeDeleteDoc()
    const navigate = useNavigate()

    const { data: channelMember, mutate } = useFrappeGetCall<{ message: { name: string } }>('frappe.client.get_value', {
        doctype: "Raven Channel Member",
        filters: JSON.stringify({ channel_id: threadID, user_id: currentUser }),
        fieldname: JSON.stringify(["name"])
    }, undefined, {
        revalidateOnFocus: false
    })

    const onLeaveThread = async () => {
        return deleteDoc('Raven Channel Member', channelMember?.message.name).then(() => {
            toast('You have left the thread')
            navigate('../')
            mutate()
        }).catch((e) => {
            toast.error('Could not leave thread', {
                description: getErrorMessage(e)
            })
        })
    }

    return (
        <DropdownMenu.Item onClick={onLeaveThread} color="red">
            <Flex gap='2' align='center'>
                <BiExit size={'16'} />
                Leave Thread
            </Flex>
        </DropdownMenu.Item>
    )
}