import { Box, Button, Dialog, Flex, IconButton, Link, Text, Tooltip } from '@radix-ui/themes'
import { clsx } from 'clsx'
import { useCallback } from 'react'
import { BiDownload, BiLink, BiShow } from 'react-icons/bi'
import { FiFile, FiFileText, FiImage, FiMusic, FiVideo } from 'react-icons/fi'

type Props = {
  fileUrl: string
  fileName: string
}

const getFileIcon = (ext: string) => {
  switch (ext) {
    case 'doc':
    case 'docx':
    case 'txt':
      return <FiFileText size={20} className='text-blue-500' />
    case 'xlsx':
      return <FiFileText size={20} className='text-green-500' />
    case 'pdf':
      return <FiFileText size={20} className='text-red-400' />
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <FiImage size={20} className='text-green-500' />
    case 'mp4':
    case 'mov':
    case 'avi':
      return <FiVideo size={20} className='text-purple-500' />
    case 'mp3':
    case 'wav':
      return <FiMusic size={20} className='text-orange-500' />
    default:
      return <FiFile size={20} className='text-gray-500' />
  }
}

const PDFPreviewButton = ({ fileUrl, fileName }: { fileUrl: string; fileName: string }) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton size='1' color='gray' variant='soft' title='Xem trước PDF'>
          <BiShow />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Content className={clsx('min-w-[64rem] bg-white dark:bg-gray-2 p-6 rounded-xl')}>
        <Dialog.Title>{fileName}</Dialog.Title>
        <Dialog.Description size='1' color='gray'>
          Xem nội dung file PDF
        </Dialog.Description>
        <Box my='4'>
          <embed src={fileUrl} type='application/pdf' width='100%' height='680px' />
        </Box>
        <Flex justify='end' gap='2' mt='3'>
          <Button variant='soft' color='gray' asChild>
            <Link href={fileUrl} download>
              <BiDownload />
              <span className='ml-1'>Tải xuống</span>
            </Link>
          </Button>
          <Dialog.Close>
            <Button color='gray' variant='soft'>
              Đóng
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

const ChatbotFileMessage = ({ fileUrl, fileName }: Props) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const icon = getFileIcon(ext)

  const handleCopyLink = useCallback(() => {
    const link = fileUrl.startsWith('http') ? fileUrl : window.location.origin + fileUrl
    navigator.clipboard.writeText(link)
  }, [fileUrl])

  return (
    <Box>
      <Flex
        align='center'
        gap='4'
        p='3'
        className='border bg-gray-1 dark:bg-gray-3 rounded-md border-gray-4 dark:border-gray-6 max-w-full w-fit'
      >
        <Flex align='center' gap='2'>
          {icon}
          <Text as='span' size='2' className='truncate max-w-[200px]'>
            {fileName}
          </Text>
        </Flex>

        <Flex align='center' gap='2'>
          {ext === 'pdf' ? (
            <PDFPreviewButton fileUrl={fileUrl} fileName={fileName} />
          ) : (
            <Tooltip content='Xem tệp'>
              <IconButton
                size='1'
                title='Xem tệp'
                variant='soft'
                color='gray'
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <BiShow />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip content='Sao chép liên kết'>
            <IconButton size='1' title='Copy link' variant='soft' color='gray' onClick={handleCopyLink}>
              <BiLink />
            </IconButton>
          </Tooltip>

          <Tooltip content='Tải xuống'>
            <IconButton asChild size='1' title='Tải xuống' variant='soft' color='gray'>
              <Link href={fileUrl} download>
                <BiDownload />
              </Link>
            </IconButton>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  )
}

export default ChatbotFileMessage
