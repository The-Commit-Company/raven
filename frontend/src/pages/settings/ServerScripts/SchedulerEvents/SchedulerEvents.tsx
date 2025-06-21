import ServerScriptNotEnabledCallout from '@/components/feature/settings/scheduler-events/ServerScriptNotEnabledForm'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateLinkAction,
  EmptyStateTitle
} from '@/components/layout/EmptyState/EmptyListViewState'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { RavenSchedulerEvent } from '@/types/RavenIntegrations/RavenSchedulerEvent'
import { isSystemManager } from '@/utils/roles'
import { Button } from '@radix-ui/themes'
import { useFrappeDocTypeEventListener, useFrappeGetDocList } from 'frappe-react-sdk'
import { LuCalendarClock } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { List } from './ScheduledMessageList'

const SchedulerEvents = () => {
  const isRavenAdmin = isSystemManager()

  const { data, error, isLoading, mutate } = useFrappeGetDocList<RavenSchedulerEvent>(
    'Raven Scheduler Event',
    {
      fields: ['name', 'disabled', 'event_frequency', 'creation', 'owner'],
      orderBy: {
        field: 'modified',
        order: 'desc'
      }
    },
    isRavenAdmin ? undefined : null,
    {
      errorRetryCount: 2
    }
  )

  useFrappeDocTypeEventListener('Raven Scheduler Event', () => {
    mutate()
  })

  return (
    <PageContainer>
      <SettingsContentContainer>
        <SettingsPageHeader
          title='Tin Nhắn Đã Lên Lịch'
          description='Bạn có thể tạo một tin nhắn đã lên lịch và bot sẽ gửi nó đến bạn vào thời gian đã định.'
          actions={
            <Button asChild disabled={!isRavenAdmin}>
              <Link to='create'>Tạo mới</Link>
            </Button>
          }
        />

        {isLoading && !error && <TableLoader columns={2} />}
        <ErrorBanner error={error} />
        <ServerScriptNotEnabledCallout />
        {data && data?.length > 0 && <List data={data} />}
        {(data?.length === 0 || !isRavenAdmin) && (
          <EmptyState>
            <EmptyStateIcon>
              <LuCalendarClock />
            </EmptyStateIcon>
            <EmptyStateTitle>Nhắc Nhở</EmptyStateTitle>
            <EmptyStateDescription>
              Lên lịch gửi tin nhắn đến bạn vào ngày và giờ cụ thể.
              <br />
              Hỗ trợ cú pháp CRON.
            </EmptyStateDescription>
            {isRavenAdmin && <EmptyStateLinkAction to='create'>Lên lịch nhắc nhở</EmptyStateLinkAction>}
          </EmptyState>
        )}
      </SettingsContentContainer>
    </PageContainer>
  )
}

export const Component = SchedulerEvents
