import { useCallback, useContext, useState } from 'react'
import { UserContext } from '../../../utils/auth/UserProvider'
import { useUserData } from '@/hooks/useUserData'
import { AddRavenUsers } from '@/components/feature/raven-users/AddRavenUsers'
import { DropdownMenu, Flex, IconButton, Link, Separator, Text } from '@radix-ui/themes'
import { BiDotsHorizontalRounded, BiSolidCircle } from 'react-icons/bi'
import { UserAvatar } from '@/components/common/UserAvatar'
import { isSystemManager } from '@/utils/roles'
import { MdWatchLater } from 'react-icons/md'
import { FaCircleDot, FaCircleMinus } from 'react-icons/fa6'
import { BsEmojiSmile } from 'react-icons/bs'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { SetCustomStatusModal } from '@/components/feature/userSettings/SetCustomStatusModal'
import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { FiSettings } from 'react-icons/fi'

export const SidebarFooter = ({ isSettingsPage = false }: { isSettingsPage?: boolean }) => {

    const userData = useUserData()
    const { logout } = useContext(UserContext)

    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
    const [isUserStatusModalOpen, setUserStatusModalOpen] = useState(false)

    const canAddUsers = isSystemManager()

    const { call } = useFrappePostCall('frappe.client.set_value')

    const setAvailabilityStatus = useCallback((status: string) => {
        call({
            doctype: 'Raven User',
            name: userData.name,
            fieldname: 'availability_status',
            value: status
        }).then(() => {
            toast.success("User availability updated")
        })
    }, [userData.name])

    return (
        <Flex
            gap='1'
            direction='column'
            px='4'
            pb='4'
            bottom='0'
            position='fixed'
            className={`w-[var(--sidebar-width)] bg-gray-2 border-r-gray-3 border-r dark:bg-gray-1`} >
            <Flex direction='column' gap='2'>
                <Separator size='4' className={`bg-gray-4 dark:bg-gray-6`} />
                <Flex justify="between" align='center' px='1'>
                    <Flex gap='2' align='center'>
                        <UserAvatar src={userData.user_image} alt={userData.full_name} isActive />
                        <Text size="2">{userData.full_name}</Text>
                    </Flex>
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <IconButton aria-label='Options' color='gray' variant='ghost'>
                                <BiDotsHorizontalRounded />
                            </IconButton>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content variant='soft'>
                            <DropdownMenu.Sub>
                                <DropdownMenu.SubTrigger>
                                    <Flex gap={'2'} align='center'><BiSolidCircle color={'green'} fontSize={'0.7rem'} /> Available</Flex>
                                </DropdownMenu.SubTrigger>
                                <DropdownMenu.SubContent>
                                    <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Available')}>
                                        <BiSolidCircle color={'green'} fontSize={'0.7rem'} /> Available
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Separator />
                                    <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Away')}>
                                        <MdWatchLater className={'text-amber-400'} fontSize={'0.75rem'} /> Away
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Do not disturb')}>
                                        <FaCircleMinus className={'text-red-600'} fontSize={'0.6rem'} /> Do not disturb
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Invisible')}>
                                        <FaCircleDot className={'text-gray-400'} fontSize={'0.6rem'} /> Invisible
                                    </DropdownMenu.Item>
                                </DropdownMenu.SubContent>
                            </DropdownMenu.Sub>
                            <DropdownMenu.Item color='gray' className={'flex justify-normal gap-2'} onClick={() => setUserStatusModalOpen(true)}>
                                <BsEmojiSmile className={'text-gray-400'} /> Set custom status
                            </DropdownMenu.Item>
                            {!isSettingsPage && <DropdownMenu.Item color='gray' className='focus-visible:ring-0 focus-visible:outline-none rounded-radius2' asChild>
                                <Link href="../settings/integrations/webhooks" className='no-underline'>
                                    <Flex gap='2' align='center'>
                                        <FiSettings className={'text-gray-400'} /> Settings
                                    </Flex>
                                </Link>
                            </DropdownMenu.Item>}
                            <DropdownMenu.Separator />
                            {canAddUsers &&
                                <DropdownMenu.Item color='gray' onClick={() => setIsAddUserModalOpen(true)} className="cursor-pointer">
                                    Add users to Raven
                                </DropdownMenu.Item>
                            }
                            <DropdownMenu.Item color='gray' className='group'>
                                <Link href="/raven_mobile" className='no-underline'>
                                    Mobile App
                                </Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onClick={logout} color='red' className='cursor-pointer'>
                                Log Out
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </Flex>
            </Flex>

            {/* <UserSettingsModal isOpen={isUserSettingsModalOpen} onOpenChange={setUserSettingsModalOpen} /> */}
            <SetCustomStatusModal isOpen={isUserStatusModalOpen} onOpenChange={setUserStatusModalOpen} />
            <AddRavenUsers isOpen={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen} />

        </Flex>
    )
}