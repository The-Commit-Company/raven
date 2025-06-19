import { ErrorCallout } from '@/components/common/Callouts/ErrorCallouts'
import { Stack } from '@/components/layout/Stack'
import { Badge, Flex, Heading, IconButton, Link, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { FrappeConfig, FrappeContext, useFrappeEventListener } from 'frappe-react-sdk'
import { useContext, useEffect, useState } from 'react'
import { LuRefreshCcw } from 'react-icons/lu'
import { TbReportAnalytics } from 'react-icons/tb'

const SocketIOHealth = () => {
  const { socket } = useContext(FrappeContext) as FrappeConfig

  const [loading, setLoading] = useState<boolean>(true)
  const [socketPingTest, setSocketPingTest] = useState('Fail')
  const [socketTransportMode, setSocketTransportMode] = useState<string | undefined>('')

  useFrappeEventListener('pong', () => {
    setSocketPingTest('Pass')
    setLoading(false)
    setSocketTransportMode(socket?.io.engine.transport.name)
  })

  const onPingCheck = () => {
    setLoading(true)
    socket?.emit('ping')
    setTimeout(() => {
      setLoading(false)
      setSocketTransportMode((s) => {
        if (!s) {
          return ''
        }
        return s
      })
    }, 5000)
  }

  useEffect(() => {
    setTimeout(onPingCheck, 5000)
  }, [])

  return (
    <Stack>
      <Heading as='h3' size='3' className='not-cal font-semibold'>
        Kiểm Tra Kết Nối Thời Gian Thực
      </Heading>
      <Text size='2' color='gray'>
        Nếu tin nhắn trên Raven không hiển thị theo thời gian thực, bạn có thể kiểm tra kết nối mạng tại đây.
      </Text>
      {!loading && socketPingTest === 'Fail' && (
        <ErrorCallout message='Kết nối thời gian thực đang không hoạt động. Tin nhắn sẽ không được cập nhật tự động.' />
      )}
      <Flex gap='3' align='center' pt='2'>
        <Text size='2' color='gray' as='span'>
          Kiểm tra Ping thời gian thực:
        </Text>
        <Flex align='center' gap='2'>
          <Badge color={loading ? 'gray' : socketPingTest === 'Pass' ? 'green' : 'red'}>
            {loading ? 'Đang tải...' : socketPingTest}
          </Badge>
          {!loading && (
            <IconButton
              title='Gửi ping'
              aria-label='gửi ping'
              color='gray'
              size='1'
              variant='ghost'
              onClick={onPingCheck}
            >
              <LuRefreshCcw className={clsx(loading ? 'animate-spin' : null)} size={12} />
            </IconButton>
          )}
        </Flex>
      </Flex>

      {socketTransportMode && (
        <Flex gap='2' align='center'>
          <Text size='2' color='gray' as='span'>
            Giao Thức Kết Nối SocketIO:
          </Text>
          <Badge color='orange'>{socketTransportMode}</Badge>
        </Flex>
      )}

      <div className='pt-2'>
        <Link
          underline='always'
          size='2'
          target='_blank'
          title='Báo cáo tình trạng hệ thống'
          href='/app/system-health-report'
        >
          <TbReportAnalytics size='16' className='-mb-0.5 pr-1' />
          Xem Báo Cáo Tình Trạng Hệ Thống
        </Link>
      </div>
    </Stack>
  )
}

export default SocketIOHealth
