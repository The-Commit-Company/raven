import { ScrollArea } from '@components/ui/scroll-area'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { UserFields } from '@raven/types/common/UserFields'
import { Search, ExternalLink, LayoutPanelTop, Rows4, Link } from 'lucide-react'
import { useState } from 'react'

interface LinkPreview {
    name: string
    url: string
    title: string
    description: string
    domain: string
    image_url?: string
    favicon_url?: string
    owner: UserFields
    creation: string
}

const dummyLinkPreviews: LinkPreview[] = [
    {
        name: '1',
        url: 'https://github.com/raven/raven-chat',
        title: 'Raven Chat Repository',
        description: 'Open source chat application built with React and TypeScript. Features real-time messaging, file sharing, and team collaboration tools.',
        domain: 'github.com',
        image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop&crop=center',
        favicon_url: 'https://github.com/favicon.ico',
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
        url: 'https://docs.google.com/document/d/example',
        title: 'Project Requirements Document',
        description: 'Comprehensive requirements for the new feature implementation. Includes user stories, technical specifications, and acceptance criteria.',
        domain: 'docs.google.com',
        image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop&crop=center',
        favicon_url: 'https://docs.google.com/favicon.ico',
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
        creation: '1 day ago'
    },
    {
        name: '3',
        url: 'https://www.figma.com/file/example',
        title: 'UI Design Mockups',
        description: 'Latest design iterations for the mobile app interface. Includes wireframes, prototypes, and design system components.',
        domain: 'figma.com',
        image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop&crop=center',
        favicon_url: 'https://www.figma.com/favicon.ico',
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
        url: 'https://www.youtube.com/watch?v=example',
        title: 'Product Demo Video',
        description: 'Walkthrough of the new features and improvements. Learn how to use the latest updates and see what\'s coming next.',
        domain: 'youtube.com',
        image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=200&fit=crop&crop=center',
        favicon_url: 'https://www.youtube.com/favicon.ico',
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
        url: 'https://unsplash.com/photos/example',
        title: 'Stock Photos Collection',
        description: 'High-quality images for the marketing campaign. Curated collection of professional photography for our brand materials.',
        domain: 'unsplash.com',
        image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=200&fit=crop&crop=center',
        favicon_url: 'https://unsplash.com/favicon.ico',
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
        url: 'https://trello.com/b/example',
        title: 'Project Management Board',
        description: 'Task tracking and project progress overview. Real-time updates on sprint progress and team collaboration.',
        domain: 'trello.com',
        image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop&crop=center',
        favicon_url: 'https://trello.com/favicon.ico',
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

const ChannelLinks = () => {

    const [searchQuery, setSearchQuery] = useState('')
    const [showPreviews, setShowPreviews] = useState(false)

    const filteredLinks = dummyLinkPreviews.filter((link) =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.owner.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="h-full flex flex-col">
            {/* Search Bar and Toggle */}
            <div className="px-1 pb-2">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search links..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border/70 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        />
                    </div>

                    {/* View Toggle Button */}
                    <button
                        onClick={() => setShowPreviews(!showPreviews)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        title={showPreviews ? "Switch to list view" : "Switch to preview view"}
                    >
                        {showPreviews ? (
                            <LayoutPanelTop className="w-4 h-4" />
                        ) : (
                            <Rows4 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Links List */}
            <ScrollArea className="flex-1">
                <div className={`px-1 pb-4 ${showPreviews ? 'space-y-3' : 'space-y-2'}`}>
                    {filteredLinks.map((link) => (
                        <div
                            key={link.name}
                            className={`group border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden ${!showPreviews ? 'p-3' : ''
                                }`}
                            tabIndex={0}
                            role="button"
                            aria-label={`Open link: ${link.title}`}>

                            {showPreviews ? (
                                <div className="flex">
                                    {/* Preview Image */}
                                    {link.image_url && (
                                        <div className="w-24 h-24 bg-muted/30 relative overflow-hidden flex-shrink-0">
                                            <img
                                                src={link.image_url}
                                                alt={link.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
                                        {/* Top section: Title and domain */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {link.favicon_url ? (
                                                    <img
                                                        src={link.favicon_url}
                                                        alt=""
                                                        className="w-4 h-4 flex-shrink-0"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <Link className="w-4 h-4 flex-shrink-0 text-muted-foreground hidden" />
                                                <h3 className="text-sm font-medium text-foreground line-clamp-1">
                                                    {link.title}
                                                </h3>
                                                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 ml-auto" />
                                            </div>
                                            <div className="text-xs text-muted-foreground/60 mt-1">
                                                {link.domain}
                                            </div>
                                        </div>

                                        {/* Bottom section: User info */}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mt-2">
                                            <UserAvatar
                                                user={link.owner}
                                                size="xs"
                                                fontSize="xs"
                                                radius="full"
                                                showStatusIndicator={false}
                                            />
                                            <span>{link.owner.full_name}</span>
                                            <span>•</span>
                                            <span>{link.creation}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Compact List View */
                                <div className="space-y-2">
                                    <div className="flex items-start gap-3">
                                        {link.favicon_url ? (
                                            <img
                                                src={link.favicon_url}
                                                alt=""
                                                className="w-5 h-5 flex-shrink-0 mt-0.5"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <Link className="w-5 h-5 flex-shrink-0 text-muted-foreground mt-0.5 hidden" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-foreground truncate">
                                                {link.title}
                                            </h3>
                                            <div className="text-xs text-muted-foreground/60">
                                                {link.domain}
                                            </div>
                                        </div>
                                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 mt-0.5" />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground/80 ml-8">
                                        <UserAvatar
                                            user={link.owner}
                                            size="xs"
                                            fontSize="xs"
                                            radius="full"
                                            showStatusIndicator={false}
                                        />
                                        <span>{link.owner.full_name}</span>
                                        <span>•</span>
                                        <span>{link.creation}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

export default ChannelLinks