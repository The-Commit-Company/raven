import { cn } from '@lib/utils'
import { Download, ExternalLink, Share2 } from 'lucide-react'
import FileTypeIcon from '../FileIcons/FileTypeIcon'
import { Button } from '@components/ui/button'

interface FileItem {
    fileName: string
    fileType: string
    fileSize: string
    onDownload?: () => void
    onView?: () => void
    onShare?: () => void
}

interface FileMessageProps {
    files: FileItem | FileItem[]
    className?: string
}

const FileMessage = ({
    files,
    className
}: FileMessageProps) => {
    const fileArray = Array.isArray(files) ? files : [files]

    const renderFile = (file: FileItem) => (
        <div className="rounded-lg border border-border bg-card p-2">
            <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                    <FileTypeIcon fileType={file.fileType} size="sm" />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-card-foreground truncate">
                        {file.fileName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                        {file.fileSize}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center">
                    {file.onView && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={file.onView}
                            title="View"
                        >
                            <ExternalLink />
                        </Button>
                    )}

                    {file.onDownload && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={file.onDownload}
                            title="Download"
                        >
                            <Download />
                        </Button>
                    )}

                    {file.onShare && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={file.onShare}
                            title="Share"
                        >
                            <Share2 />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className={cn(
            "w-full grid grid-cols-3 gap-2",
            className
        )}>
            {fileArray.map((file, index) => (
                <div key={index}>
                    {renderFile(file)}
                </div>
            ))}
        </div>
    )
}

export default FileMessage 