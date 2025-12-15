import { X } from 'lucide-react'

export interface LinkPreviewData {
    title: string
    description: string
    image?: string
    site_name: string
}

export interface LinkPreviewProps {
    href: string
    data: LinkPreviewData
    onHide?: () => void
}

const YoutubePreview = ({ href }: { href: string }) => {
    // Extract video ID from YouTube URL
    const getVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url.match(regExp)
        return match && match[2].length === 11 ? match[2] : null
    }

    const videoId = getVideoId(href)

    return (
        <div className="pt-2">
            <iframe
                width="480"
                height="270"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; modestbranding=1"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="rounded-lg"
            />
        </div>
    )
}

const WebLinkPreview = ({ href, data, onHide }: { href: string, data: LinkPreviewData, onHide?: () => void }) => {
    return (
        <div className="pt-2 max-w-[580px] relative group/linkpreview">
            <div className="bg-card border border-border rounded-lg p-0 sm:p-3 hover:shadow-xs transition-shadow">
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex sm:items-center flex-col sm:flex-row sm:gap-4 gap-0 sm:pr-4"
                >
                    {data.image && (
                        <img
                            src={data.image}
                            alt={data.title}
                            className="sm:max-w-[220px] w-full h-[160px] sm:h-[120px] object-cover sm:object-center sm:-ml-3 sm:-mt-3 sm:-mb-3 rounded-l-lg"
                        />
                    )}
                    <div className="gap-1.5 sm:p-0 py-3 px-3 flex-1">
                        <div className="sm:gap-1 gap-0.5">
                            <div className="font-semibold text-sm block text-card-foreground">{data.title}</div>
                            <div className="text-xs text-muted-foreground">{data.site_name}</div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{data.description}</p>
                    </div>
                </a>
            </div>
            {onHide && (
                <div className="absolute top-4 right-2 z-10 group-hover/linkpreview:visible invisible sm:block hidden">
                    <button
                        onClick={onHide}
                        className="bg-black/40 text-white rounded-md p-1 hover:bg-black/60 transition-colors"
                        title="Hide link preview"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    )
}

const LinkPreview = ({ href, data, onHide }: LinkPreviewProps) => {
    if (!href) return null

    // Check if it's a YouTube URL
    const isYoutube = /youtube\.com|youtu\.be/.test(href)

    if (isYoutube) {
        return <YoutubePreview href={href} />
    }

    return <WebLinkPreview href={href} data={data} onHide={onHide} />
}

export default LinkPreview 