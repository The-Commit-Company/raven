import { FileMessage } from "../../../../../../../types/Messaging/Message"
import { getFileExtension, getFileName, isVideoFile } from "../../../../../utils/operations"
import { UserFields } from "@/utils/users/UserListProvider"
import { Box, Button, Dialog, Flex, IconButton, Link, Text } from "@radix-ui/themes"
import { BoxProps } from "@radix-ui/themes/dist/cjs/components/box"
import { BiDownload, BiLink, BiShow } from "react-icons/bi"
import { useToast } from "@/hooks/useToast"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { DateMonthAtHourMinuteAmPm } from "@/utils/dateConversions"
import { clsx } from "clsx"
import { FileExtensionIcon } from "@/utils/layout/FileExtIcon"
import { memo } from "react"

interface FileMessageBlockProps extends BoxProps {
    message: FileMessage,
    user?: UserFields,
}

export const FileMessageBlock = memo(({ message, user, ...props }: FileMessageBlockProps) => {

    const fileExtension = getFileExtension(message.file)

    const fileName = getFileName(message.file)

    const isVideo = isVideoFile(fileExtension)

    const isPDF = fileExtension === 'pdf'
    const { toast } = useToast()

    const copyLink = () => {
        if (message.file.startsWith('http') || message.file.startsWith('https')) {
            navigator.clipboard.writeText(message.file)
        }
        else {
            navigator.clipboard.writeText(window.location.origin + message.file)
        }

        toast({
            title: 'Link copied',
            duration: 800,
            variant: 'accent'
        })
    }

    return <Box {...props}>

        {isVideo ? <Flex gap='2' direction='column'>
            <Link
                href={message.file}
                size='1'
                download
                title="Download"
                color='gray'
                target='_blank'>{fileName}</Link>
            <video src={message.file} controls width='480' className="rounded-md shadow-md">

            </video>
        </Flex> :


            <Flex
                align='center'
                gap='4'
                p='4'
                className="border-2 bg-gray-2 dark:bg-gray-4 rounded-md border-gray-4  dark:border-gray-6 shadow-sm">
                <Flex align='center' gap='2'>
                    <FileExtensionIcon ext={fileExtension} />
                    <Text as='span' size='2' className="text-ellipsis overflow-hidden line-clamp-1">{fileName}</Text>
                </Flex>

                <Flex align='center' gap='2'>
                    {isPDF && <PDFPreviewButton message={message} user={user} />}
                    <IconButton
                        size='1'
                        title="Copy link"
                        color='gray'
                        onClick={copyLink}
                        variant="soft"
                    >
                        <BiLink />
                    </IconButton>
                    <IconButton
                        size='1'
                        asChild
                        title="Download"
                        color='gray'
                        variant="soft"
                    >
                        <Link className='no-underline' href={message.file} download>
                            <BiDownload />
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
                    size='1'
                    color='gray'
                    variant="soft"
                    title='Preview'
                >
                    <BiShow />
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
                            <BiDownload />
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