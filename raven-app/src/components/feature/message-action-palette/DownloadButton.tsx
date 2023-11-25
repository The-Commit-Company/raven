
import { IconButton, Link, Tooltip } from '@radix-ui/themes'
import { Download } from 'lucide-react'

export const DownloadButton = ({ file }: { file: string }) => {
    return (
        <Tooltip content='download'>
            <Link href={file} target='_blank'>
                <IconButton
                    variant='soft'
                    size='1'
                    color='gray'
                    aria-label='download message'>
                    <Download size='14' />
                </IconButton>
            </Link>
        </Tooltip>
    )
}