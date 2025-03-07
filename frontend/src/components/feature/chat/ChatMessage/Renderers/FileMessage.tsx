import { FileMessage } from "../../../../../../../types/Messaging/Message"
import { getFileExtension, getFileName, isVideoFile } from "../../../../../utils/operations"
import { UserFields } from "@/utils/users/UserListProvider"
import { Box, BoxProps, Button, Dialog, Flex, IconButton, Link, Text } from "@radix-ui/themes"
import { BiDownload, BiLink, BiShow } from "react-icons/bi"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { DateMonthAtHourMinuteAmPm } from "@/utils/dateConversions"
import { clsx } from "clsx"
import { FileExtensionIcon } from "@/utils/layout/FileExtIcon"
import { memo } from "react"
import { toast } from "sonner"
import { useIsDesktop } from "@/hooks/useMediaQuery"

type FileMessageBlockProps = BoxProps & {
    message: FileMessage,
    user?: UserFields,
}

export const FileMessageBlock = memo(({ message, user, ...props }: FileMessageBlockProps) => {

    const fileURL = message.file?.split('?')[0]

    const fileExtension = getFileExtension(fileURL)

    const fileName = getFileName(fileURL)

    const isVideo = isVideoFile(fileExtension)

    const isPDF = fileExtension === 'pdf'

    const copyLink = () => {
        if (fileURL.startsWith('http') || fileURL.startsWith('https')) {
            navigator.clipboard.writeText(fileURL)
        }
        else {
            navigator.clipboard.writeText(window.location.origin + fileURL)
        }

        toast.success('Link copied')
    }

    const isDesktop = useIsDesktop()

    return <Box {...props}>

        {isVideo ? <Flex gap='2' direction='column'>
            <Link
                href={message.file}
                size='1'
                download
                title="Download"
                color='gray'
                target='_blank'>{fileName}</Link>
            <video src={message.file} controls className="rounded-md shadow-md max-h-96 max-w-[620px]">

            </video>
        </Flex> :


            <Flex
                align='center'
                gap='4'
                p='4'
                className="border bg-gray-1 dark:bg-gray-3 rounded-md border-gray-4 dark:border-gray-6 w-fit">
                <Flex align='center' gap='2'>
                    <FileExtensionIcon ext={fileExtension} />
                    <Text as='span' size='2' className="text-ellipsis overflow-hidden line-clamp-1">{fileName}</Text>
                </Flex>

                <Flex align='center' gap='2'>
                    {isPDF && isDesktop && <PDFPreviewButton message={message} user={user} />}
                    <IconButton
                        size={{
                            md: '1',
                            sm: '2',
                        }}
                        title="Copy link"
                        color='gray'
                        onClick={copyLink}
                        variant="soft"
                    >
                        <BiLink className="text-lg sm:text-base" />
                    </IconButton>
                    <IconButton
                        size={{
                            md: '1',
                            sm: '2',
                        }}
                        asChild
                        title="Download"
                        color='gray'
                        variant="soft"
                    >
                        <Link className='no-underline' href={message.file} download>
                            {isDesktop ? <BiDownload className="text-lg sm:text-base" /> : <BiShow className="text-lg sm:text-base" />}
                        </Link>
                    </IconButton>
                </Flex>
            </Flex>
        }

    </Box>

})


const PDFPreviewButton = ({ message, user }: {
    message: FileMessage,
    user?: UserFields,
}) => {

    const fileName = getFileName(message.file)

    return <Box>
        <Dialog.Root>
            <Dialog.Trigger>
                <IconButton
                    size={{
                        md: '1',
                        sm: '2',
                    }}
                    color='gray'
                    variant="soft"
                    title='Preview'
                >
                    <BiShow className="text-lg sm:text-base" />
                </IconButton>
            </Dialog.Trigger>
            <Dialog.Content className={clsx(DIALOG_CONTENT_CLASS, 'min-w-[64rem]')} size='4'>
                <Dialog.Title size='3'>{fileName}</Dialog.Title>
                <Dialog.Description color='gray' size='1'>{user?.full_name ?? message.owner} on <DateMonthAtHourMinuteAmPm date={message.creation} /></Dialog.Description>
                <Box my='4'>
                    <embed
                        src={message.file}
                        type="application/pdf"
                        width="100%"
                        height='680px'
                    />
                </Box>
                <Flex justify='end' gap='2' mt='3'>
                    <Button variant='soft' color='gray' asChild>
                        <Link className='no-underline' href={message.file} download>
                            <BiDownload size='18' />
                            Download
                        </Link>
                    </Button>
                    <Dialog.Close>
                        <Button color='gray' variant='soft'>Close</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    </Box>
}