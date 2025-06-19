import SocketIOHealth from '@/components/feature/settings/help/SocketIOHealth'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { Stack } from '@/components/layout/Stack'
import { useBoolean } from '@/hooks/useBoolean'
import { Button, Code, Link, Separator, Text } from '@radix-ui/themes'
import { FiExternalLink } from 'react-icons/fi'
import { LuMessageSquareWarning } from 'react-icons/lu'
import CreateSupportTicketDialog from '../../components/feature/settings/help/SupportRequest'

const HelpAndSupport = () => {
  const [open, { on, off }] = useBoolean()

  return (
    <PageContainer>
      <SettingsContentContainer>
        <SettingsPageHeader title='Trợ giúp & Hỗ trợ' />

        <Stack gap='5'>
          <Stack>
            <Text color='gray' size='2' as='span' className='font-medium'>
              Bạn có ý tưởng hoặc gặp sự cố?
            </Text>
            <div>
              <Button
                size='2'
                onClick={on}
                variant='outline'
                color='gray'
                className='not-cal cursor-pointer'
                title='Nhấn vào đây để gửi phản hồi hoặc báo lỗi'
                aria-label='Nhấn vào đây để gửi phản hồi hoặc báo lỗi'
              >
                <LuMessageSquareWarning /> Liên hệ với chúng tôi
              </Button>
            </div>
          </Stack>
          <Separator size='4' />

          <SocketIOHealth />
          <Separator size='4' />

          <ul className='list-none'>
            <li>
              <Link
                color='gray'
                underline='always'
                size='2'
                target='_blank'
                title='https://github.com/The-Commit-Company/raven'
                href='https://github.com/The-Commit-Company/raven'
              >
                GitHub <FiExternalLink size='12' />
              </Link>
            </li>
            <li>
              <Link
                color='gray'
                underline='always'
                size='2'
                target='_blank'
                title='https://community.ravenapp.cloud'
                href='https://community.ravenapp.cloud'
              >
                Cộng đồng <FiExternalLink size='12' />
              </Link>
            </li>
            <li>
              <Link
                color='gray'
                underline='always'
                size='2'
                target='_blank'
                title='https://ravenchat.ai'
                href='https://ravenchat.ai'
              >
                Website <FiExternalLink size='12' />
              </Link>
            </li>
            <li>
              <Link
                underline='always'
                size='2'
                target='_blank'
                color='gray'
                title='support@thecommit.company'
                href='mailto:support@thecommit.company'
              >
                Email hỗ trợ
              </Link>
            </li>
          </ul>

          <Stack gap='0'>
            <Text size='3' color='gray'>
              <Text size='5' className='cal-sans text-gray-12 dark:text-white'>
                NextConnect
              </Text>{' '}
              <Code size='2' variant='ghost'>
                v1.0.0 beta
              </Code>
            </Text>
            <Text size='2' color='gray'>
              Được phát triển bởi HaiNamTech
            </Text>
          </Stack>
        </Stack>
      </SettingsContentContainer>

      <CreateSupportTicketDialog open={open} onClose={off} />
    </PageContainer>
  )
}

export const Component = HelpAndSupport
