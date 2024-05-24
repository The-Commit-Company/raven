import { useContext, useState } from 'react'
import { UserContext } from '../../../utils/auth/UserProvider'
import { useUserData } from '@/hooks/useUserData'
import { AddRavenUsers } from '@/components/feature/raven-users/AddRavenUsers'
import { DropdownMenu, Flex, IconButton, Link, Separator, Text } from '@radix-ui/themes'
import { BiDotsHorizontalRounded } from 'react-icons/bi'
import { UserAvatar } from '@/components/common/UserAvatar'
import { isSystemManager } from '@/utils/roles'

export const SidebarFooter = ({ isSettingsPage = false }: { isSettingsPage?: boolean }) => {

    const userData = useUserData()
    const { logout } = useContext(UserContext)

    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)

    const canAddUsers = isSystemManager()

    return (
        <Flex
            gap='1'
            direction='column'
            // px='4'
            bottom='0'
            position='fixed'
            className={`sm:w-[var(--sidebar-width)] sm:px-4 pb-8 sm:pb-4 w-full bg-gray-2 border-r-gray-3 border-r dark:bg-gray-1`}
        >
            <Flex direction='column' gap='2'>
                <Separator size='4' className={`bg-gray-4 dark:bg-gray-6`} />
                <Flex justify="between" align='center' className='sm:px-1 px-6 pt-2 sm:pt-0'>
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
                            {canAddUsers &&
                                <DropdownMenu.Item color='gray' onClick={() => setIsAddUserModalOpen(true)} className="cursor-pointer hidden sm:block">
                                    Add users to Raven
                                </DropdownMenu.Item>
                            }
                            {canAddUsers &&
                                <DropdownMenu.Separator className='hidden sm:block' />
                            }
                            {!isSettingsPage && <DropdownMenu.Item color='gray' className='focus-visible:ring-0 focus-visible:outline-none rounded-radius2 cursor-pointer hidden sm:block' asChild>
                                <Link href="../settings/integrations/webhooks" className='no-underline'>
                                    Settings
                                </Link>
                            </DropdownMenu.Item>}
                            <DropdownMenu.Item onClick={logout} color='red' className='cursor-pointer'>
                                Log Out
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </Flex>
            </Flex>
            <AddRavenUsers isOpen={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen} />
        </Flex>
    )
}