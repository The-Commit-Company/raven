import { IconButton, Link, Tooltip } from '@radix-ui/themes'
import { BiDownload } from 'react-icons/bi'

export const DownloadButton = ({ file }: { file: string }) => {
    return (
        <Tooltip content='download'>
            <Link href={file} target='_blank'>
                <IconButton
                    variant='soft'
                    size='1'
                    color='gray'
                    aria-label='download message'>
                    <BiDownload />
                </IconButton>
            </Link>
        </Tooltip>
    )
}