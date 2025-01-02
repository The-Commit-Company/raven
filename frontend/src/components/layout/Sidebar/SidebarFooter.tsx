import { useContext, useState } from 'react'
import { UserContext } from '../../../utils/auth/UserProvider'
import { useUserData } from '@/hooks/useUserData'
import { Box, DropdownMenu, IconButton, Separator, Tooltip } from '@radix-ui/themes'
import { UserAvatar } from '@/components/common/UserAvatar'
import { BsEmojiSmile } from 'react-icons/bs'
import useCurrentRavenUser from '@/hooks/useCurrentRavenUser'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { MdOutlineExitToApp } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { SetUserAvailabilityMenu } from '@/components/feature/userSettings/AvailabilityStatus/SetUserAvailabilityMenu'
import { SetCustomStatusModal } from '@/components/feature/userSettings/CustomStatus/SetCustomStatusModal'
import PushNotificationToggle from '@/components/feature/userSettings/PushNotifications/PushNotificationToggle'
import { __ } from '@/utils/translations'
import { Stack } from '../Stack'
import { LuNavigation, LuSettings } from 'react-icons/lu'

export const SidebarFooter = () => {

    const userData = useUserData()
    const { logout } = useContext(UserContext)

    const [isUserStatusModalOpen, setUserStatusModalOpen] = useState(false)

    const { myProfile } = useCurrentRavenUser()
    const isActive = useIsUserActive(userData.name)

    const navigate = useNavigate()

    return <Stack className='mx-auto py-0' align='center' gap='2'>
        <Box>
            <Tooltip content="Workspace Explorer" side='right'>
                <IconButton aria-label='Workspace Explorer' size='3' color='gray' variant='ghost' onClick={() => navigate('/workspace-explorer')}>
                    <LuNavigation size='18' />
                </IconButton>
            </Tooltip>
        </Box>
        <Box>
            <Tooltip content="Settings" side='right'>
                <IconButton aria-label='Settings' size='3' color='gray' variant='ghost' onClick={() => navigate('/settings/profile')}>
                    <LuSettings size='18' />
                </IconButton>
            </Tooltip>
        </Box>
        <Separator size='4' className={`bg-gray-4 dark:bg-gray-6`} />
        <Box className='pb-4 sm:pb-0 pt-2'>
            <DropdownMenu.Root>
                <Tooltip content="Options" side='right'>
                    <DropdownMenu.Trigger>
                        <IconButton aria-label='Options' color='gray' variant='ghost' className='p-0 bg-transparent hover:bg-transparent'>
                            <UserAvatar
                                src={myProfile?.user_image}
                                alt={myProfile?.full_name}
                                size='2'
                                className='hover:shadow-sm transition-all duration-200'
                                availabilityStatus={myProfile?.availability_status}
                                isActive={isActive} />

                        </IconButton>
                    </DropdownMenu.Trigger>
                </Tooltip>
                <DropdownMenu.Content variant='soft'>
                    <SetUserAvailabilityMenu />
                    <DropdownMenu.Item color='gray' className={'flex justify-normal gap-2'} onClick={() => setUserStatusModalOpen(true)}>
                        <BsEmojiSmile size='14' /> {__("Set custom status")}
                    </DropdownMenu.Item>
                    <PushNotificationToggle />
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item color='red' className={'flex justify-normal gap-2'} onClick={logout}>
                        <MdOutlineExitToApp size='14' /> {__("Log Out")}
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

        </Box>
        <SetCustomStatusModal isOpen={isUserStatusModalOpen} onOpenChange={setUserStatusModalOpen} />
    </Stack>
}