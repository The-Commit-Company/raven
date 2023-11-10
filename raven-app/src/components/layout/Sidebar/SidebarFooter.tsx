import { useContext, useState } from 'react'
import { UserContext } from '../../../utils/auth/UserProvider'
import { useUserData } from '@/hooks/useUserData'
import { AddRavenUsers } from '@/components/feature/raven-users/AddRavenUsers'
import { DropdownMenu, Flex, IconButton, Link, Separator, Text } from '@radix-ui/themes'
import { BsThreeDots } from 'react-icons/bs'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useTheme } from '@/ThemeProvider'

export const SidebarFooter = () => {

    const userData = useUserData()
    const { logout } = useContext(UserContext)

    const { appearance } = useTheme()

    const sidebarBgColor = appearance === 'light' ? 'bg-[var(--slate-2)]' : 'bg-[var(--color-background)]'

    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)

    return (
        <Flex gap='1' direction='column' px='3' pb='3' bottom='0' position='fixed' className={`w-[var(--sidebar-width)] ${sidebarBgColor}`} >
            <Flex direction='column' gap='2'>
                <Separator size='4' />
                <Flex justify="between" align='center' px='1'>
                    <Flex gap='2' align='center'>
                        <UserAvatar src={userData.user_image} alt={userData.full_name} isActive />
                        <Text size="2">{userData.full_name}</Text>
                    </Flex>
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <IconButton aria-label='Options' color='gray' variant='ghost'>
                                <BsThreeDots />
                            </IconButton>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content variant='soft'>
                            <DropdownMenu.Item color='gray' onClick={() => setIsAddUserModalOpen(true)} className="cursor-pointer">
                                Add Raven users
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item color='gray' className='group'>
                                <Link href="/app" className='no-underline'>
                                    Desk Interface
                                </Link>
                            </DropdownMenu.Item>
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
            <AddRavenUsers isOpen={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen} />
        </Flex>
    )
}