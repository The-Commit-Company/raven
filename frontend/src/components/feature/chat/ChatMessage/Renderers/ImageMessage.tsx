import { getFileName } from '@/utils/operations'
import { ImageMessage } from '../../../../../../../types/Messaging/Message'
import { Box, Button, Dialog, Flex, IconButton, Link } from '@radix-ui/themes'
import { Suspense, lazy, memo, useState, useMemo } from 'react'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { BiDownload, BiX } from 'react-icons/bi'
import { UserFields } from '@/utils/users/UserListProvider'
import { DateMonthAtHourMinuteAmPm } from '@/utils/dateConversions'
import { clsx } from 'clsx'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { Blurhash } from "react-blurhash";

const ImageViewer = lazy(() => import('@/components/common/ImageViewer'))

interface ImageMessageProps {
    message: ImageMessage,
    user?: UserFields,
    // Do not load image when scrolling
    isScrolling?: boolean
}

export const ImageMessageBlock = memo(({ message, isScrolling = false, user }: ImageMessageProps) => {

    const [isOpen, setIsOpen] = useState(false)
    // Show skeleton loader when image is loading

    const isMobile = useIsMobile()

    const fileName = getFileName(message.file)

    const [isVisible, setIsVisible] = useState<boolean>(true)

    const { height, width } = useMemo(() => {
        if (!isVisible) {
            return { height: '0', width: '0' }
        }

        let height = '200'
        let width = '300'

        if (message.thumbnail_height) {
            height = isMobile ? String(message.thumbnail_height / 2) : String(message.thumbnail_height)
        }

        if (message.thumbnail_width) {
            width = isMobile ? String(message.thumbnail_width / 2) : String(message.thumbnail_width)
        }

        return { height, width }
    }, [message.thumbnail_height, message.thumbnail_width, isMobile, isVisible])

    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const onLoad = () => {
        setIsImageLoaded(true)
    }

    return (
        <Flex direction='column' gap='1' py='1'>
            <Box
                className={`relative rounded-md cursor-pointer transition-all duration-300 ease-ease-out-circ overflow-hidden`}
                role='button'
                onClick={() => setIsOpen(!isScrolling && true)}
                style={{
                    height: height + 'px',
                    width: width + 'px',
                }}>

                {/* Absolute positioned skeleton loader */}
                <Box className=' absolute top-0 z-0 left-0' style={{
                    height: height + 'px',
                    width: width + 'px',
                }}>
                    {message.blurhash && message.blurhash.length === 28 && !isImageLoaded ? <Blurhash hash={message.blurhash} width={width + 'px'} height={height + 'px'} /> :
                        <Box style={{
                            height: height + 'px',
                            width: width + 'px',
                        }} className='bg-gray-3 z-0 dark:bg-gray-5 rounded-md'>

                        </Box>
                    }
                </Box>
                {/* We are not hiding the image when scrolling because we already know the height and width of the image
                Hence no layout shift */}
                <img
                    src={message.file}
                    loading='lazy'
                    className='z-50 absolute top-0 left-0 rounded-md shadow-md object-cover'
                    height={height}
                    style={{
                        maxHeight: height + 'px',
                        maxWidth: width + 'px',
                        minHeight: height + 'px',
                        minWidth: width + 'px',
                    }}
                    onLoad={onLoad}
                    width={width}
                    alt={`Image file sent by ${message.owner} at ${message.creation}`}
                    onContextMenu={(e) => {
                        e.stopPropagation();
                    }}
                />
            </Box>
            {!isScrolling &&
                <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
                    <Dialog.Content className={clsx(
                        DIALOG_CONTENT_CLASS,
                        'sm:max-w-[88vw]',
                        isMobile && 'fixed inset-0 w-full h-full max-w-none p-0 rounded-none bg-black overflow-hidden'
                    )}>
                        {isMobile && (
                            <IconButton
                                size='3'
                                variant="ghost"
                                color="gray"
                                className='fixed top-4 right-4 z-10 text-white'
                                onClick={() => setIsOpen(false)}
                            >
                                <BiX size='24' />
                            </IconButton>
                        )}

                        <Dialog.Title size='3' className='h-0 invisible sm:h-auto sm:visible'>{fileName}</Dialog.Title>
                        <Dialog.Description color='gray' size='1' className='h-0 invisible sm:h-auto sm:visible'>{user?.full_name ?? message.owner} on <DateMonthAtHourMinuteAmPm date={message.creation} /></Dialog.Description>
                        <Box className={clsx(
                            'w-full mx-auto items-center flex justify-center',
                            isMobile ? 'h-[100dvh] absolute inset-0' : 'my-4'
                        )}>
                            <Suspense fallback={
                                <img
                                    src={message.file}
                                    loading='lazy'
                                    width='100%'
                                    className={clsx(
                                        'object-contain',
                                        isMobile ? 'h-[100dvh] w-full' : 'rounded-md shadow-md max-h-[90vh] sm:max-h-[600px]'
                                    )}
                                    alt={`Image file sent by ${message.owner} at ${message.creation}`}
                                />
                            }>
                                <ImageViewer>
                                    <img
                                        src={message.file}
                                        loading='lazy'
                                        width='100%'
                                        className={clsx(
                                            'object-contain',
                                            isMobile ? 'h-[100dvh] w-full' : 'rounded-md shadow-md max-h-[90vh] sm:max-h-[600px]'
                                        )}
                                        alt={`Image file sent by ${message.owner} at ${message.creation}`}
                                    />
                                </ImageViewer>
                            </Suspense>
                        </Box>
                        {!isMobile && (
                            <Flex justify='end' gap='2' mt='3'>
                                <Button variant='soft' color='gray' asChild>
                                    <Link className='no-underline' href={message.file} download>
                                        <BiDownload />
                                        Download
                                    </Link>
                                </Button>
                                <Dialog.Close>
                                    <Button color='gray' variant='soft'>Close</Button>
                                </Dialog.Close>
                            </Flex>
                        )}
                    </Dialog.Content>
                </Dialog.Root>
            }
        </Flex>
    )
})
