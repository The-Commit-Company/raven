import { useTheme } from '@/ThemeProvider'
import { commandMenuOpenAtom } from '@/components/feature/CommandMenu/CommandMenu'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useSidebarMode } from '@/utils/layout/sidebar'
import { __ } from '@/utils/translations'
import { Box, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes'
import { useSetAtom } from 'jotai'
import { BiMoon, BiSun } from 'react-icons/bi'
import { TbSearch } from 'react-icons/tb'
import { CreateChannelButton } from '@/components/feature/channels/CreateChannelModal'
import { CreateLabelButton } from '@/components/feature/labels/CreateLabelModal'
import { LuSettings } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'

function isLabelObject(val: unknown): val is { labelId: string; labelName: string } {
  return typeof val === 'object' && val !== null && 'labelId' in val && 'labelName' in val
}

export const SidebarHeader = () => {
  const isDesktop = useIsDesktop()
  const { mode, title, labelID } = useSidebarMode()
  const navigate = useNavigate()

  const isLabelMode = title === 'Nhãn' || !!labelID
  if (isDesktop) {
    return (
      <header style={{ padding: mode === 'hide-filter' ? '20px 60px' : '6px 10px' }}>
        <Flex justify='between' px='2' align='center' pt='2'>
          <span className='font-medium text-base'>{isLabelObject(title) ? title.labelName : title}</span>
          <Box>
            {isLabelMode ? (
              <CreateLabelButton />
            ) : (
              <>
                <SearchButton />
                <CreateChannelButton />
              </>
            )}
          </Box>
        </Flex>
      </header>
    )
  }

  return (
    <header>
      <Flex justify='between' px='3' align='center' pt='1' height='48px'>
        <Text as='span' size='6' className='cal-sans pl-1'>
          raven
        </Text>
        <Flex align='center' gap='4' className='pr-1 sm:pr-0'>
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
          {isLabelMode ? (
            <button className='p-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded'>
              <CreateLabelButton />
            </button>
          ) : (
            <>
              <SearchButton />
              <CreateChannelButton />
            </>
          )}
        </Flex>
      </Flex>
    </header>
  )
}

// const CommandMenuButton = () => {
//   const setOpen = useSetAtom(commandMenuOpenAtom)

//   return (
//     <Button
//       onClick={() => setOpen(true)}
//       aria-label='Open command menu'
//       title={__('Open command menu')}
//       className='bg-gray-3 hover:bg-gray-4 p-2 rounded-md flex justify-between items-center min-w-48 text-gray-11 sm:hover:text-gray-12'
//       color='gray'
//     >
//       <HStack>
//         <TbSearch className='text-lg sm:text-base' />
//         <Text as='span' className='not-cal -mt-0.5' weight='regular'>
//           Search
//         </Text>
//       </HStack>
//       <div className='dark:font-bold'>{getKeyboardMetaKeyString()}+K</div>
//     </Button>
//   )
// }
/** Only used on mobile */
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

/** Only used on mobile */
const ColorModeToggleButton = () => {
  const { appearance, setAppearance } = useTheme()

  const toggleTheme = () => {
    if (appearance === 'light') {
      setAppearance('dark')
    } else {
      setAppearance('light')
    }
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
