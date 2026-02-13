import { UserAvatar } from "@components/features/message/UserAvatar"
import { UserFields } from "@raven/types/common/UserFields"
import { ExternalLink, LayoutPanelTop, Link, Rows4, Search } from "lucide-react"
import { useState } from "react"

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
        name: "1",
        url: "https://github.com/raven/raven-chat",
        title: "Raven Chat Repository",
        description: "Open source chat application.",
        domain: "github.com",
        image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop&crop=center",
        favicon_url: "https://github.com/favicon.ico",
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
        url: "https://docs.google.com/document/d/example",
        title: "Project Requirements Document",
        description: "Comprehensive requirements for the new feature.",
        domain: "docs.google.com",
        image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop&crop=center",
        favicon_url: "https://docs.google.com/favicon.ico",
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
    },
]

export function DMLinksDrawer() {
    const [searchQuery, setSearchQuery] = useState("")
    const [showPreviews, setShowPreviews] = useState(false)

    const filteredLinks = dummyLinkPreviews.filter(
        (link) =>
            link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.owner.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col">
            <div className="shrink-0 px-1 pb-2">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search links..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-md border border-border/70 bg-background py-2 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPreviews(!showPreviews)}
                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title={showPreviews ? "Switch to list view" : "Switch to preview view"}
                    >
                        {showPreviews ? <LayoutPanelTop className="h-4 w-4" /> : <Rows4 className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className={`px-1 pb-4 ${showPreviews ? "space-y-3" : "space-y-2"}`}>
                    {filteredLinks.map((link) => (
                        <div
                            key={link.name}
                            className={`group cursor-pointer overflow-hidden rounded-lg border border-border/70 transition-colors hover:bg-muted/50 ${!showPreviews ? "p-3" : ""}`}
                            tabIndex={0}
                            role="button"
                            aria-label={`Open link: ${link.title}`}
                        >
                            {showPreviews ? (
                                <div className="flex">
                                    {link.image_url && (
                                        <div className="relative flex h-24 w-24 shrink-0 overflow-hidden bg-muted/30">
                                            <img
                                                src={link.image_url}
                                                alt={link.title}
                                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                                        <div className="flex items-center gap-2">
                                            {link.favicon_url ? (
                                                <img src={link.favicon_url} alt="" className="h-4 w-4 shrink-0" />
                                            ) : (
                                                <Link className="hidden h-4 w-4 shrink-0 text-muted-foreground" />
                                            )}
                                            <h3 className="line-clamp-1 text-sm font-medium text-foreground">
                                                {link.title}
                                            </h3>
                                            <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground/60">{link.domain}</div>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground/80">
                                            <UserAvatar user={link.owner} size="xs" showStatusIndicator={false} />
                                            <span>{link.owner.full_name}</span>
                                            <span>•</span>
                                            <span>{link.creation}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start gap-3">
                                        {link.favicon_url ? (
                                            <img src={link.favicon_url} alt="" className="mt-0.5 h-5 w-5 shrink-0" />
                                        ) : (
                                            <Link className="mt-0.5 hidden h-5 w-5 shrink-0 text-muted-foreground" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-sm font-medium text-foreground">
                                                {link.title}
                                            </h3>
                                            <div className="mt-0.5 text-xs text-muted-foreground/70">{link.domain}</div>
                                        </div>
                                        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                    </div>
                                    <div className="ml-8 flex items-center gap-2 text-xs text-muted-foreground/80">
                                        <UserAvatar user={link.owner} size="xs" showStatusIndicator={false} />
                                        <span>{link.owner.full_name}</span>
                                        <span>•</span>
                                        <span>{link.creation}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
        </div>
    )
}
