import useIsUserOnLeave from "@/hooks/fetchers/useIsUserOnLeave"
import { Badge } from "@radix-ui/themes"

const OnLeaveBadge = ({ userID }: { userID: string }) => {
    const isOnLeave = useIsUserOnLeave(userID)
    if (isOnLeave) {
        return <Badge color="yellow" variant="surface">On Leave</Badge>
    }
    return null
}

export default OnLeaveBadge