import { UserAvatar } from "@components/features/message/UserAvatar"
import { UserFields } from "@raven/types/common/UserFields"
import { Download, Search } from "lucide-react"
import { useState } from "react"
import FileTypeIcon from "@components/common/FileIcons/FileTypeIcon"

interface FileAttachment {
    name: string
    file_name: string
    file_type: string
    file_size: string
    file_url: string
    message_type: "File" | "Image"
    owner: UserFields
    creation: string
    thumbnail_width?: number
    thumbnail_height?: number
    file_thumbnail?: string
}

const dummyFiles: FileAttachment[] = [
    {
        name: "1",
        file_name: "Q4_Financial_Report.pdf",
        file_type: "pdf",
        file_size: "2MB",
        file_url: "https://example.com/files/Q4_Financial_Report.pdf",
        message_type: "File",
        owner: {
            name: "john.doe",
            full_name: "John Doe",
            user_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            first_name: "John",
            enabled: 1,
            type: "User",
            availability_status: "Available",
            custom_status: undefined,
        },
        creation: "2 hours ago",
    },
    {
        name: "2",
        file_name: "Product_Design_Mockups.png",
        file_type: "png",
        file_size: "3MB",
        file_url: "https://example.com/files/Product_Design_Mockups.png",
        message_type: "Image",
        owner: {
            name: "jane.smith",
            full_name: "Jane Smith",
            user_image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            first_name: "Jane",
            enabled: 1,
            type: "User",
            availability_status: "Available",
            custom_status: undefined,
        },
        creation: "1 day ago",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=150&h=150&fit=crop&crop=center",
    },
    {
        name: "3",
        file_name: "Meeting_Notes.docx",
        file_type: "docx",
        file_size: "1MB",
        file_url: "https://example.com/files/Meeting_Notes.docx",
        message_type: "File",
        owner: {
            name: "mike.wilson",
            full_name: "Mike Wilson",
            user_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            first_name: "Mike",
            enabled: 1,
            type: "User",
            availability_status: "Away",
            custom_status: undefined,
        },
        creation: "2 days ago",
    },
]

export function DMFilesDrawer() {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredFiles = dummyFiles.filter(
        (file) =>
            file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            file.owner.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            file.file_type.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col">
            <div className="shrink-0 px-1 pb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-md border border-border/70 bg-background py-2 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
            </div>

            <div className="space-y-2 px-1 pb-4">
                    {filteredFiles.map((file) => (
                        <div
                            key={file.name}
                            className="group cursor-pointer rounded-lg border border-border/70 p-3 transition-colors hover:bg-muted/50"
                            tabIndex={0}
                            role="button"
                            aria-label={`View ${file.file_name}`}
                        >
                            <div className="flex gap-3">
                                <div className="mt-0.5 shrink-0">
                                    {file.message_type === "Image" && file.file_thumbnail ? (
                                        <img
                                            src={file.file_thumbnail}
                                            alt={file.file_name}
                                            className="h-8 w-8 rounded-md border border-border/40 object-cover"
                                        />
                                    ) : (
                                        <FileTypeIcon fileType={file.file_type} size="sm" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-0.5 flex items-start justify-between gap-2">
                                        <h3 className="truncate pr-2 text-sm font-medium text-foreground">
                                            {file.file_name}
                                        </h3>
                                        <Download className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                                        <span>{file.file_size}</span>
                                        <span>•</span>
                                        <span className="uppercase">{file.file_type}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="ml-11 mt-2 flex items-center gap-2 text-xs text-muted-foreground/80">
                                <UserAvatar user={file.owner} size="xs" showStatusIndicator={false} />
                                <span>{file.owner.full_name}</span>
                                <span>•</span>
                                <span>{file.creation}</span>
                            </div>
                        </div>
                    ))}
                </div>
        </div>
    )
}
