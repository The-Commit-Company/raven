import { PropsWithChildren } from 'react'
import { Box, Flex } from '@radix-ui/themes'
import { useParams } from 'react-router-dom'
import clsx from 'clsx'

export const PageHeader = ({ children }: PropsWithChildren) => {
  const { threadID } = useParams()

  return (
    <header className='dark:bg-gray-2 bg-white absolute top-0 w-100' style={{ zIndex: 999 }}>
      <Box py='2' className={clsx('border-gray-4 sm:dark:border-gray-6 border-b px-4 sm:px-0 sm:ml-4', threadID)}>
        <Flex justify='between'>{children}</Flex>
      </Box>
    </header>
  )
}
