import { ScrollArea } from '@components/ui/scroll-area'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { UserFields } from '@raven/types/common/UserFields'
import { FileIconComponent } from '@components/common/FileIcon/FileIcon'
import { Download, Search } from 'lucide-react'
import { useState } from 'react'

interface FileAttachment {
    name: string
    file_name: string
    file_type: string
    file_size: string
    file_url: string
    message_type: 'File' | 'Image'
    owner: UserFields
    creation: string
    thumbnail_width?: number
    thumbnail_height?: number
    file_thumbnail?: string
}

const dummyFiles: FileAttachment[] = [
    {
        name: '1',
        file_name: 'Q4_Financial_Report.pdf',
        file_type: 'pdf',
        file_size: '2MB',
        file_url: 'https://example.com/files/Q4_Financial_Report.pdf',
        message_type: 'File',
        owner: {
            name: 'john.doe',
            full_name: 'John Doe',
            user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            first_name: 'John',
            enabled: 1,
            type: 'User',
            availability_status: 'Available',
            custom_status: undefined
        },
        creation: '2 hours ago'
    },
    {
        name: '2',
        file_name: 'Product_Design_Mockups.png',
        file_type: 'png',
        file_size: '3MB',
        file_url: 'https://example.com/files/Product_Design_Mockups.png',
        message_type: 'Image',
        owner: {
            name: 'jane.smith',
            full_name: 'Jane Smith',
            user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            first_name: 'Jane',
            enabled: 1,
            type: 'User',
            availability_status: 'Available',
            custom_status: undefined
        },
        creation: '1 day ago',
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=150&h=150&fit=crop&crop=center'
    },
    {
        name: '3',
        file_name: 'Sales_Data_Q4.xlsx',
        file_type: 'xlsx',
        file_size: '1MB',
        file_url: 'https://example.com/files/Sales_Data_Q4.xlsx',
        message_type: 'File',
        owner: {
            name: 'mike.wilson',
            full_name: 'Mike Wilson',
            user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            first_name: 'Mike',
            enabled: 1,
            type: 'User',
            availability_status: 'Away',
            custom_status: undefined
        },
        creation: '2 days ago'
    },
    {
        name: '4',
        file_name: 'Team_Presentation.pptx',
        file_type: 'pptx',
        file_size: '5MB',
        file_url: 'https://example.com/files/Team_Presentation.pptx',
        message_type: 'File',
        owner: {
            name: 'sarah.jones',
            full_name: 'Sarah Jones',
            user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            first_name: 'Sarah',
            enabled: 1,
            type: 'User',
            availability_status: 'Available',
            custom_status: undefined
        },
        creation: '3 days ago'
    },
    {
        name: '5',
        file_name: 'Meeting_Recording.mp4',
        file_type: 'mp4',
        file_size: '50MB',
        file_url: 'https://example.com/files/Meeting_Recording.mp4',
        message_type: 'File',
        owner: {
            name: 'john.doe',
            full_name: 'John Doe',
            user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            first_name: 'John',
            enabled: 1,
            type: 'User',
            availability_status: 'Available',
            custom_status: undefined
        },
        creation: '4 days ago'
    },
    {
        name: '6',
        file_name: 'Project_Requirements.docx',
        file_type: 'docx',
        file_size: '1.5MB',
        file_url: 'https://example.com/files/Project_Requirements.docx',
        message_type: 'File',
        owner: {
            name: 'jane.smith',
            full_name: 'Jane Smith',
            user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            first_name: 'Jane',
            enabled: 1,
            type: 'User',
            availability_status: 'Do not disturb',
            custom_status: undefined
        },
        creation: '1 week ago'
    }
]

const ChannelFiles = () => {

    const [searchQuery, setSearchQuery] = useState('')

    const filteredFiles = dummyFiles.filter((file) =>
        file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.owner.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.file_type.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="h-full flex flex-col">
            {/* Search Bar */}
            <div className="px-1 pb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border/70 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                </div>
            </div>

            {/* Files List */}
            <ScrollArea className="flex-1">
                <div className="px-1 space-y-2 pb-4">
                    {filteredFiles.map((file) => (
                        <div
                            key={file.name}
                            className="group p-3 border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            tabIndex={0}
                            role="button"
                            aria-label={`View ${file.file_name}`}>
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {file.message_type === 'Image' && file.file_thumbnail ? (
                                        <div className="relative">
                                            <img
                                                src={file.file_thumbnail}
                                                alt={file.file_name}
                                                className="h-8 w-8 object-cover rounded-md border border-border/40"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-md" />
                                        </div>
                                    ) : (
                                        <FileIconComponent fileType={file.file_type} size="sm" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-0.5">
                                        <h3 className="text-sm font-medium text-foreground truncate pr-2">
                                            {file.file_name}
                                        </h3>
                                        <Download className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 mt-0.5" />
                                    </div>

                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                                        <span>{file.file_size}</span>
                                        <span>•</span>
                                        <span className="uppercase">{file.file_type}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mt-2 ml-11">
                                <UserAvatar
                                    user={file.owner}
                                    size="xs"
                                    fontSize="xs"
                                    radius="full"
                                    showStatusIndicator={false}
                                />
                                <span>{file.owner.full_name}</span>
                                <span>•</span>
                                <span>{file.creation}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

export default ChannelFiles