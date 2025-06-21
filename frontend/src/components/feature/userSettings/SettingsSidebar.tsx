import { __ } from '@/utils/translations'
import { Box, Flex, Separator, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { PropsWithChildren, createElement } from 'react'
import { IconType } from 'react-icons'
import { BiBot, BiBuildings, BiMobileAlt, BiNotification } from 'react-icons/bi'
import { BsBoxes } from 'react-icons/bs'
import { FiLifeBuoy } from 'react-icons/fi'
import { LuCircleUserRound } from 'react-icons/lu'
import { NavLink } from 'react-router-dom'

export const SettingsSidebar = () => {
  return (
    <Box className='h-[calc(100vh-57px)] overflow-y-auto fixed w-64 border-r pt-2 border-gray-4 dark:border-gray-4'>
      <Flex direction='column' gap='2' className='px-4'>
        <SettingsGroup title='Tài Khoản Của Tôi' icon={LuCircleUserRound}>
          <SettingsSidebarItem title='Hồ sơ cá nhân' to='profile' />
          <SettingsSidebarItem title='Giao diện' to='appearance' />
          <SettingsSidebarItem title='Tùy chọn' to='preferences' />
        </SettingsGroup>
        <SettingsSeparator />
        <SettingsGroup title='Không Gian Làm Việc' icon={BiBuildings}>
          <SettingsSidebarItem title='Workspaces' to='workspaces' />
          <SettingsSidebarItem title='Người dùng' to='users' />
          <SettingsSidebarItem title='Biểu tượng cảm xúc' to='emojis' />
        </SettingsGroup>
        <SettingsSeparator />
        <SettingsGroup title='Tích Hợp' icon={BsBoxes}>
          {/* <SettingsSidebarItem title="ERPNext" to='erpnext' /> */}
          <SettingsSidebarItem title='Nhân sự' to='hr' />
          <SettingsSidebarItem title='Thông báo tài liệu' to='document-notifications' />
          <SettingsSidebarItem title='Xem trước tài liệu' to='document-previews' />
          <SettingsSidebarItem title='Hành động tin nhắn' to='message-actions' />
          <SettingsSidebarItem title='Tin nhắn đã lên lịch' to='scheduled-messages' />
          <SettingsSidebarItem title='Webhook' to='webhooks' />
          {/* <SettingsSidebarItem title="Frappe LMS" to='frappe-lms' /> */}
          {/* <SettingsSidebarItem title="Frappe CRM" to='frappe-crm' /> */}
        </SettingsGroup>
        <SettingsSeparator />
        <SettingsGroup title='Trí Tuệ Nhân Tạo (AI)' icon={BiBot}>
          <SettingsSidebarItem title='Bot' to='bots' />
          <SettingsSidebarItem title='Hàm' to='functions' />
          {/* <SettingsSidebarItem title='Nguồn tệp' to='file-sources' /> */}
          <SettingsSidebarItem title='Hướng dẫn' to='instructions' />
          <SettingsSidebarItem title='Lệnh' to='commands' />
          <SettingsSidebarItem title='Cài đặt AI' to='openai-settings' />
        </SettingsGroup>
        <SettingsSeparator />
        <div className='flex flex-col gap-1 -mx-1'>
          <SettingsSidebarItem title='Ứng dụng di động' to='mobile-app' standalone icon={BiMobileAlt} />
          <SettingsSidebarItem title='Thông báo đẩy' to='push-notifications' standalone icon={BiNotification} />
          <SettingsSidebarItem title='Trợ giúp & Hỗ trợ' to='help' standalone icon={FiLifeBuoy} />
        </div>
      </Flex>
    </Box>
  )
}

const SettingsGroup = ({ title, icon, children }: PropsWithChildren<{ title: string; icon: IconType }>) => {
  return (
    <Flex direction='column' className='gap-0.5'>
      <SettingsSidebarGroupHeader title={title} icon={icon} />
      {children}
    </Flex>
  )
}

const SettingsSeparator = () => {
  return <Separator className={'w-full'} />
}
const SettingsSidebarGroupHeader = ({ title, icon }: { title: string; icon: IconType }) => {
  return (
    <Flex className='py-1.5 flex items-center gap-1.5 text-gray-11'>
      {createElement(icon, { size: 15 })}
      <Text size='1'>{__(title)}</Text>
    </Flex>
  )
}

const SettingsSidebarItem = ({
  title,
  to,
  end,
  standalone = false,
  icon
}: {
  title: string
  to: string
  end?: boolean
  standalone?: boolean
  icon?: IconType
}) => {
  const activeClass = 'bg-slate-3 dark:bg-slate-4 hover:bg-slate-3 hover:dark:bg-slate-4'

  return (
    <NavLink to={to} end={end} className='no-underline'>
      {({ isActive }) => {
        return (
          <Box className={!standalone ? 'ml-4' : ''}>
            <Flex
              className={clsx(
                `px-2 py-1 text-gray-12 rounded-md w-full items-center`,
                isActive ? activeClass : 'bg-transparent hover:bg-slate-2 hover:dark:bg-slate-3',
                standalone ? 'gap-1.5' : ''
              )}
            >
              {icon ? createElement(icon, { size: 15 }) : null}
              <Text className='text-[13px]' weight='medium'>
                {__(title)}
              </Text>
            </Flex>
          </Box>
        )
      }}
    </NavLink>
  )
}
