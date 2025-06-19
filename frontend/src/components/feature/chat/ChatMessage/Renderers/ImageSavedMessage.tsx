import { useIsMobile } from '@/hooks/useMediaQuery'
import { DateMonthAtHourMinuteAmPm } from '@/utils/dateConversions'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { getFileName } from '@/utils/operations'
import { UserFields } from '@/utils/users/UserListProvider'
import { Box, Button, Dialog, Flex, IconButton, Link } from '@radix-ui/themes'
import { clsx } from 'clsx'
import { Suspense, lazy, memo, useEffect, useMemo, useRef, useState } from 'react'
import { Blurhash } from 'react-blurhash'
import { BiChevronDown, BiChevronRight, BiDownload, BiX } from 'react-icons/bi'
import { ImageMessage } from '../../../../../../../types/Messaging/Message'

const ImageViewer = lazy(() => import('@/components/common/ImageViewer'))

interface ImageMessageProps {
  message: ImageMessage
  user?: UserFields
  // Do not load image when scrolling
  isScrolling?: boolean
}

export const ImageSavedMessage = memo(({ message, isScrolling = false, user }: ImageMessageProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const isMobile = useIsMobile()
  const fileName = getFileName(message.file)
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Responsive breakpoints
  const getBreakpoint = () => {
    if (typeof window === 'undefined') return 'lg'
    const width = window.innerWidth
    if (width < 480) return 'xs'
    if (width < 768) return 'sm'
    if (width < 1024) return 'md'
    return 'lg'
  }

  // Calculate responsive image dimensions with 16:9 aspect ratio
  const { height, width } = useMemo(() => {
    if (!isVisible) {
      return { height: '0', width: '0' }
    }

    const breakpoint = getBreakpoint()
    const aspectRatio = 16 / 9 // Fixed 16:9 aspect ratio

    // Base width for different breakpoints
    let baseWidth: number
    switch (breakpoint) {
      case 'xs':
        baseWidth = Math.min(containerWidth || 280, 280)
        break
      case 'sm':
        baseWidth = Math.min(containerWidth || 320, 320)
        break
      case 'md':
        baseWidth = Math.min(containerWidth || 400, 400)
        break
      default:
        baseWidth = Math.min(containerWidth || (isMobile ? 350 : 480), isMobile ? 350 : 480)
    }

    // Calculate height based on 16:9 ratio
    let finalWidth = baseWidth
    let finalHeight = finalWidth / aspectRatio

    // Ensure minimum dimensions
    finalWidth = Math.max(finalWidth, 160) // Min width for 16:9
    finalHeight = Math.max(finalHeight, 90) // Min height for 16:9

    // Ensure maximum dimensions to prevent overflow
    const maxHeight = isMobile ? window.innerHeight * 0.3 : 270
    if (finalHeight > maxHeight) {
      finalHeight = maxHeight
      finalWidth = finalHeight * aspectRatio
    }

    // Ensure width doesn't exceed container
    const maxContainerWidth = (containerWidth || window.innerWidth) * 0.95
    if (finalWidth > maxContainerWidth) {
      finalWidth = maxContainerWidth
      finalHeight = finalWidth / aspectRatio
    }

    return {
      height: Math.round(finalHeight).toString(),
      width: Math.round(finalWidth).toString()
    }
  }, [isMobile, isVisible, containerWidth])

  // Update container width on resize
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateContainerWidth()
    window.addEventListener('resize', updateContainerWidth)
    return () => window.removeEventListener('resize', updateContainerWidth)
  }, [])

  const showImage = () => {
    setIsVisible(true)
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 200)
  }

  return (
    <Flex ref={containerRef} direction='column' gap='1' className='w-full max-w-full overflow-hidden'>
      <Flex className='py-1 items-center min-w-0'>
        <IconButton
          size='1'
          variant='ghost'
          color='gray'
          radius='large'
          className='flex-shrink-0 pl-0 pr-[6px] font-bold hover:bg-transparent text-accent-a11 hover:text-gray-12'
          aria-label={`Click to ${isVisible ? 'hide' : 'show'} image`}
          title={`${isVisible ? 'Hide' : 'Show'} image`}
          onClick={() => (isVisible ? setIsVisible(false) : showImage())}
        >
          {isVisible ? (
            <BiChevronDown size='20' className='pt-[1px]' />
          ) : (
            <BiChevronRight size='20' className='pt-[1px]' />
          )}
        </IconButton>
        <Link href={message.file} size='1' color='gray' target='_blank' className='truncate min-w-0 flex-1'>
          {fileName}
        </Link>
      </Flex>

      {isVisible && (
        <Box
          ref={contentRef}
          className={`relative rounded-md cursor-pointer transition-all duration-300 ease-out overflow-hidden flex-shrink-0`}
          role='button'
          onClick={() => setIsOpen(!isScrolling && true)}
          style={{
            height: height + 'px',
            width: width + 'px',
            maxWidth: '100%'
          }}
        >
          {/* Skeleton/Blurhash loader */}
          <Box
            className='absolute top-0 z-0 left-0 w-full h-full'
            style={{
              height: height + 'px',
              width: width + 'px',
              aspectRatio: '16 / 9'
            }}
          >
            {message.blurhash ? (
              <Blurhash
                hash={message.blurhash}
                width={width + 'px'}
                height={height + 'px'}
                className='w-full h-full object-cover rounded-md'
                style={{ aspectRatio: '16 / 9' }}
              />
            ) : (
              <Box
                style={{
                  height: height + 'px',
                  width: width + 'px',
                  aspectRatio: '16 / 9'
                }}
                className='bg-gray-3 z-0 dark:bg-gray-5 rounded-md w-full h-full'
              />
            )}
          </Box>

          {/* Main image with 16:9 aspect ratio */}
          <img
            src={message.file}
            loading='lazy'
            className='z-50 absolute top-0 left-0 rounded-md shadow-md w-full h-full'
            height={height}
            width={width}
            style={{
              height: height + 'px',
              width: width + 'px',
              aspectRatio: '16 / 9',
              objectFit: 'cover'
            }}
            alt={`Image file sent by ${message.owner} at ${message.creation}`}
            onContextMenu={(e) => {
              e.stopPropagation()
            }}
          />
        </Box>
      )}

      {!isScrolling && (
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
          <Dialog.Content
            className={clsx(
              DIALOG_CONTENT_CLASS,
              // Desktop styles
              'sm:max-w-[min(90vw,800px)] sm:max-h-[90vh]',
              // Mobile styles - full screen
              isMobile &&
                'fixed inset-0 w-full h-full max-w-none max-h-none p-0 rounded-none bg-black overflow-hidden m-0'
            )}
          >
            {isMobile && (
              <IconButton
                size='3'
                variant='ghost'
                color='gray'
                className='fixed top-4 right-4 z-50 text-white bg-black/50 hover:bg-black/70 rounded-full'
                onClick={() => setIsOpen(false)}
              >
                <BiX size='24' />
              </IconButton>
            )}

            <Dialog.Title size='3' className={clsx('truncate', isMobile ? 'sr-only' : 'block')}>
              {fileName}
            </Dialog.Title>

            <Dialog.Description color='gray' size='1' className={clsx('truncate', isMobile ? 'sr-only' : 'block')}>
              {user?.full_name ?? message.owner} on <DateMonthAtHourMinuteAmPm date={message.creation} />
            </Dialog.Description>

            <Box
              className={clsx(
                'w-full flex items-center justify-center overflow-hidden',
                isMobile ? 'h-full absolute inset-0 p-4' : 'my-4 max-h-[calc(90vh-120px)]'
              )}
            >
              <Suspense
                fallback={
                  <img
                    src={message.file}
                    loading='lazy'
                    className={clsx(
                      'object-contain max-w-full max-h-full',
                      isMobile ? 'w-auto h-auto' : 'rounded-md shadow-md'
                    )}
                    alt={`Image file sent by ${message.owner} at ${message.creation}`}
                  />
                }
              >
                <ImageViewer>
                  <img
                    src={message.file}
                    loading='lazy'
                    className={clsx(
                      'object-contain max-w-full max-h-full',
                      isMobile ? 'w-auto h-auto' : 'rounded-md shadow-md'
                    )}
                    alt={`Image file sent by ${message.owner} at ${message.creation}`}
                  />
                </ImageViewer>
              </Suspense>
            </Box>

            {!isMobile && (
              <Flex justify='end' gap='2' mt='3' className='flex-shrink-0'>
                <Button variant='soft' color='gray' asChild>
                  <Link className='no-underline' href={message.file} download>
                    <BiDownload />
                    Download
                  </Link>
                </Button>
                <Dialog.Close>
                  <Button color='gray' variant='soft'>
                    Close
                  </Button>
                </Dialog.Close>
              </Flex>
            )}
          </Dialog.Content>
        </Dialog.Root>
      )}
    </Flex>
  )
})
