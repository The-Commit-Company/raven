
import { IconButton, Link, Tooltip } from '@radix-ui/themes'
import { BsDownload } from 'react-icons/bs'

export const DownloadButton = ({ file }: { file: string }) => {
    return (
        <Tooltip content='download'>
            <Link href={file} target='_blank'>
                <IconButton
                    variant='soft'
                    size='1'
                    color='gray'
                    aria-label='download message'>
                    <BsDownload fontSize={'0.75rem'} />
                </IconButton>
            </Link>
        </Tooltip>
    )
}