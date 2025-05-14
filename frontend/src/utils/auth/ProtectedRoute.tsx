import { Stack } from '@/components/layout/Stack'
import { Flex, Text } from '@radix-ui/themes'
import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { UserContext } from './UserProvider'

type ProtectedRouteProps = {
  requireAuth?: boolean
  redirectPath?: string
}

export const ProtectedRoute = ({
  requireAuth = true,
  redirectPath = requireAuth ? '/login' : '/'
}: ProtectedRouteProps) => {
  const { currentUser, isLoading } = useContext(UserContext)

  // Hiển thị màn hình loading khi đang tải dữ liệu người dùng
  if (isLoading) {
    return (
      <Flex justify='center' align='center' height='100vh' width='100vw' className='animate-fadein'>
        <Stack className='text-center' gap='1'>
          <Text size='7' className='cal-sans tracking-normal'>
            raven
          </Text>
          <Text color='gray' weight='medium'>
            Setting up your workspace...
          </Text>
        </Stack>
      </Flex>
    )
  }

  const isAuthenticated = currentUser && currentUser !== 'Guest'

  // Nếu route yêu cầu xác thực nhưng người dùng chưa đăng nhập
  // HOẶC route không yêu cầu xác thực nhưng người dùng đã đăng nhập
  if ((requireAuth && !isAuthenticated) || (!requireAuth && isAuthenticated)) {
    return <Navigate to={redirectPath} />
  }

  return <Outlet />
}
