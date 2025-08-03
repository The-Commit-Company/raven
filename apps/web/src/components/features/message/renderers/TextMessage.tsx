import { UserFields } from "@raven/types/common/UserFields"
import { UserAvatar } from "../UserAvatar"
import { extractUrlsFromText, isValidUrl } from "../../../../utils/linkUtils"
import LinkPreview, { LinkPreviewData } from "./LinkPreview"

const getDummyPreviewData = (): LinkPreviewData => ({
    title: "Link Preview",
    description: "This is a preview of the linked content.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
    site_name: "Website"
})

export default function TextMessage({ user, message, time, name }: {
    user: UserFields,
    message: string,
    time: string,
    name: string
}) {
    const urls = extractUrlsFromText(message)

    const firstValidUrl = urls.find(url => isValidUrl(url))

    const handleHidePreview = () => {
        console.log("Hide preview for message:", name)
    }

    return (
        <div className="flex items-start gap-3">
            <UserAvatar user={user} size="md" />
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{user?.full_name || user?.name || "User"}</span>
                    <span className="text-xs font-light text-muted-foreground/90">{time}</span>
                </div>
                <div className="text-[13px] text-primary">{message}</div>
                {firstValidUrl && (
                    <LinkPreview
                        href={firstValidUrl}
                        data={getDummyPreviewData()}
                        onHide={handleHidePreview}
                    />
                )}
            </div>
        </div>
    )
}
