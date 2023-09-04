import { IconButton, Link, Tooltip } from '@chakra-ui/react'
import { BsDownload } from 'react-icons/bs'

export const DownloadButton = ({ file }: { file: string }) => {
    return (
        <Tooltip hasArrow label='download' size='xs' placement='top' rounded='md'>
            <IconButton
                as={Link}
                href={file}
                isExternal
                aria-label="download file"
                icon={<BsDownload />}
                size='xs' />
        </Tooltip>
    )
}