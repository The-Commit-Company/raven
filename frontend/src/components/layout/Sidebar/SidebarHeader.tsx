import { useTheme } from '@/ThemeProvider'
import { UserAvatar } from '@/components/common/UserAvatar'
import { commandMenuOpenAtom } from '@/components/feature/CommandMenu/CommandMenu'
import { CreateChannelButton } from '@/components/feature/channels/CreateChannelModal'
import { CreateLabelButton } from '@/components/feature/labels/CreateLabelModal'
import { SetUserAvailabilityMenu } from '@/components/feature/userSettings/AvailabilityStatus/SetUserAvailabilityMenu'
import PushNotificationToggle from '@/components/feature/userSettings/PushNotifications/PushNotificationToggle'
import useCurrentRavenUser from '@/hooks/useCurrentRavenUser'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { useIsDesktop, useIsMobile, useIsTablet } from '@/hooks/useMediaQuery'
import { useUserData } from '@/hooks/useUserData'
import { UserContext } from '@/utils/auth/UserProvider'
import { useSidebarMode } from '@/utils/layout/sidebar'
import { truncateText } from '@/utils/textUtils/truncateText'
import { __ } from '@/utils/translations'
import { Box, DropdownMenu, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes'
import { useSetAtom } from 'jotai'
import { useContext, useState, Suspense, lazy } from 'react'
import { BiMoon, BiSun } from 'react-icons/bi'
import { FiPlus } from 'react-icons/fi'
import { LuPlus, LuSettings } from 'react-icons/lu'
import { MdOutlineExitToApp } from 'react-icons/md'
import { TbSearch } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'

const CreateConversationModal = lazy(() => import('../../feature/labels/conversations/CreateConversationModal'))

function isLabelObject(val: unknown): val is { labelId: string; labelName: string } {
  return typeof val === 'object' && val !== null && 'labelId' in val && 'labelName' in val
}

export const SidebarHeader = () => {
  const isDesktop = useIsDesktop()
  const isTablet = useIsTablet()
  const isMobile = useIsMobile()
  const { mode, title, labelID } = useSidebarMode()
  const navigate = useNavigate()
  const userData = useUserData()
  const { logout } = useContext(UserContext)
  const { myProfile } = useCurrentRavenUser()
  const isActive = useIsUserActive(userData.name)

  const maxLength = isTablet || isMobile ? 18 : 30

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // const labelTitle = isLabelObject(title) ? title : ''

  const displayTitle = isLabelObject(title) ? title.labelName : title ? title : ''

  const renderCreateModal = labelID && (
    <Suspense fallback={null}>
      <CreateConversationModal name={labelID} label={title} isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} />
    </Suspense>
  )

  if (isDesktop) {
    return (
      <>
        <header style={{ padding: mode === 'hide-filter' ? '20px 60px' : '6px 10px' }}>
          <Flex justify='between' px='2' align='center' pt='2'>
            <span className='font-medium text-base truncate'>{truncateText(displayTitle, maxLength)}</span>
            <Box>
              {title === 'Nhãn' ? (
                <CreateLabelButton />
              ) : labelID ? (
                <IconButton
                  onClick={() => setIsCreateOpen(true)}
                  variant='soft'
                  size='1'
                  radius='large'
                  color='gray'
                  aria-label='Thêm conversation'
                  title='Thêm conversation'
                  className='transition-all ease-ease text-gray-10 bg-transparent hover:bg-gray-3 hover:text-gray-12 cursor-pointer'
                >
                  <FiPlus size='16' />
                </IconButton>
              ) : (
                <>
                  <SearchButton />
                  <CreateChannelButton />
                </>
              )}
            </Box>
          </Flex>
        </header>

        {renderCreateModal}
      </>
    )
  }

  // === Mobile ===
  return (
    <>
      <header>
        <Flex justify='between' px='3' align='center' pt='1' height='48px'>
          <Text as='span' size='6' className='cal-sans pl-1'>
            raven
          </Text>
          <Flex justify='between' align='center' gap='4' className='pr-1 sm:pr-0'>
            <DropdownMenu.Root>
              <Tooltip content='Options' side='right'>
                <DropdownMenu.Trigger>
                  <IconButton
                    aria-label='Options'
                    color='gray'
                    variant='ghost'
                    size='2'
                    className='p-0 bg-transparent hover:bg-transparent'
                  >
                    <UserAvatar
                      src={myProfile?.user_image}
                      alt={myProfile?.full_name}
                      size='1'
                      className='hover:shadow-sm transition-all duration-200'
                      availabilityStatus={myProfile?.availability_status}
                      isActive={isActive}
                    />
                  </IconButton>
                </DropdownMenu.Trigger>
              </Tooltip>
              <DropdownMenu.Content variant='soft'>
                <SetUserAvailabilityMenu />
                <PushNotificationToggle />
                <DropdownMenu.Separator />
                <DropdownMenu.Item color='red' className='flex justify-normal gap-2' onClick={logout}>
                  <MdOutlineExitToApp size='14' /> {__('Log Out')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            <IconButton
              aria-label='Settings'
              size='2'
              color='gray'
              variant='ghost'
              onClick={() => navigate('/settings/profile')}
            >
              <LuSettings size='14' />
            </IconButton>

            <ColorModeToggleButton />

            {title === 'Nhãn' ? (
              <button className='bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded'>
                <CreateLabelButton />
              </button>
            ) : labelID ? (
              <IconButton
                onClick={() => setIsCreateOpen(true)}
                variant='soft'
                size='1'
                radius='large'
                color='gray'
                aria-label='Thêm cuộc trò chuyện'
                title='Thêm cuộc trò chuyện'
                className='transition-all ease-ease text-gray-10 bg-transparent hover:bg-gray-3 hover:text-gray-12 cursor-pointer'
              >
                <FiPlus size='14' />
              </IconButton>
            ) : (
              <>
                <SearchButton />
                <CreateChannelButton />
              </>
            )}
          </Flex>
        </Flex>
      </header>

      {renderCreateModal}
    </>
  )
}

const SearchButton = () => {
  const setOpen = useSetAtom(commandMenuOpenAtom)

  return (
    <Tooltip content='Tìm kiếm'>
      <IconButton
        size={{ initial: '2', md: '1' }}
        aria-label='Mở mục tìm kiếm'
        title={__('Mở mục tìm kiếm')}
        color='gray'
        className='text-gray-11 sm:hover:text-gray-12 p-2 cursor-pointer'
        variant='ghost'
        onClick={() => setOpen(true)}
      >
        <TbSearch className='text-lg sm:text-base' />
      </IconButton>
    </Tooltip>
  )
}

const ColorModeToggleButton = () => {
  const { appearance, setAppearance } = useTheme()

  const toggleTheme = () => {
    setAppearance(appearance === 'light' ? 'dark' : 'light')
  }

  return (
    <Flex align='center' justify='center' pr='1'>
      <IconButton
        size={{ initial: '2', md: '1' }}
        aria-label='Toggle theme'
        title={__('Toggle theme')}
        color='gray'
        className='text-gray-11 sm:hover:text-gray-12 p-2'
        variant='ghost'
        onClick={toggleTheme}
      >
        {appearance === 'light' ? (
          <BiMoon className='text-lg sm:text-base' />
        ) : (
          <BiSun className='text-lg sm:text-base' />
        )}
      </IconButton>
    </Flex>
  )
}
