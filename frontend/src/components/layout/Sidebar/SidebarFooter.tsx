import { useContext, useState } from 'react'
import { UserContext } from '../../../utils/auth/UserProvider'
import { useUserData } from '@/hooks/useUserData'
import { AddRavenUsers } from '@/components/feature/raven-users/AddRavenUsers'
import { DropdownMenu, Flex, IconButton, Separator, Text } from '@radix-ui/themes'
import { BiDotsHorizontalRounded } from 'react-icons/bi'
import { UserAvatar } from '@/components/common/UserAvatar'
import { isSystemManager } from '@/utils/roles'
import { BsEmojiSmile } from 'react-icons/bs'
import useCurrentRavenUser from '@/hooks/useCurrentRavenUser'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { SlSettings } from 'react-icons/sl'
import { TbUsersPlus } from 'react-icons/tb'
import PushNotificationToggle from '@/components/feature/userSettings/PushNotifications/PushNotificationToggle'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { MdOutlineExitToApp } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { SetUserAvailabilityMenu } from '@/components/feature/userSettings/AvailabilityStatus/SetUserAvailabilityMenu'
import { SetCustomStatusModal } from '@/components/feature/userSettings/CustomStatus/SetCustomStatusModal'

export const SidebarFooter = ({ isSettingsPage = false }: { isSettingsPage?: boolean }) => {

    const userData = useUserData()
    const { logout } = useContext(UserContext)

    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
    const [isUserStatusModalOpen, setUserStatusModalOpen] = useState(false)

    const canAddUsers = isSystemManager()

    const { myProfile } = useCurrentRavenUser()
    const isActive = useIsUserActive(userData.name)

    const isDesktop = useIsDesktop()
    const navigate = useNavigate()

    return (
        <Flex
            gap='1'
            direction='column'
            bottom='0'
            position='fixed'
            className={`sm:w-[var(--sidebar-width)] sm:px-4 pb-8 sm:pb-4 w-full bg-gray-2 border-r-gray-3 border-r dark:bg-gray-1`}
        >
            <Flex direction='column' gap='2'>
                <Separator size='4' className={`bg-gray-4 dark:bg-gray-6`} />
                <Flex justify="between" align='center' className='sm:px-1 px-6 pt-2 sm:pt-0'>
                    <Flex gap='2' align='center'>
                        <UserAvatar src={userData.user_image} alt={userData.full_name} availabilityStatus={myProfile?.availability_status} isActive={isActive} />
                        <Text size="2">{userData.full_name}</Text>
                    </Flex>
                    <Flex gap='3' align='center'>
                        <IconButton aria-label='Settings' color='gray' variant='ghost' onClick={() => navigate('/channel/settings')}>
                            <SlSettings />
                        </IconButton>
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                                <IconButton aria-label='Options' color='gray' variant='ghost'>
                                    <BiDotsHorizontalRounded />
                                </IconButton>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content variant='soft'>
                                <SetUserAvailabilityMenu />
                                <DropdownMenu.Item color='gray' className={'flex justify-normal gap-2'} onClick={() => setUserStatusModalOpen(true)}>
                                    <BsEmojiSmile size='14' /> Set custom status
                                </DropdownMenu.Item>
                                {canAddUsers && <DropdownMenu.Separator className='hidden sm:block' />}
                                <PushNotificationToggle />
                                {canAddUsers && isDesktop &&
                                    <DropdownMenu.Item color='gray' onClick={() => setIsAddUserModalOpen(true)} className={'flex justify-normal gap-2'}>
                                        <TbUsersPlus size='14' /> Add users to Raven
                                    </DropdownMenu.Item>
                                }
                                {/* {!isSettingsPage && isDesktop && <DropdownMenu.Item color='gray' className='focus-visible:ring-0 focus-visible:outline-none rounded-radius2 cursor-pointer' asChild>
                                <Link href="../settings/integrations/webhooks" className='no-underline'>
                                    <Flex gap='2' align='center'>
                                        <SlSettings size='14' /> Settings
                                    </Flex>
                                </Link>
                            </DropdownMenu.Item>} */}
                                <DropdownMenu.Item color='red' className={'flex justify-normal gap-2'} onClick={logout}>
                                    <MdOutlineExitToApp size='14' />Log Out
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    </Flex>
                </Flex>
            </Flex>

            <SetCustomStatusModal isOpen={isUserStatusModalOpen} onOpenChange={setUserStatusModalOpen} />
            <AddRavenUsers isOpen={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen} />

        </Flex>
    )
}