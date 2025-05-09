import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { cn } from "@lib/utils"

export interface User {
    id: string
    name: string
    image?: string
}

interface GroupedAvatarsProps {
    users: User[]
    max?: number
    size?: "sm" | "md" | "lg"
    className?: string
}

export function GroupedAvatars({ users, max = 3, size = "md", className }: GroupedAvatarsProps) {

    const totalUsers = users.length
    const visibleUsers = users.slice(0, max)
    const remainingUsers = totalUsers - max > 0 ? Math.min(totalUsers - max, 9) : 0

    const sizeClasses = {
        sm: "h-7 w-7 text-xs",
        md: "h-9 w-9 text-sm",
        lg: "h-11 w-11 text-base",
    }

    return (
        <div className={cn("flex -space-x-2", className)}>
            {visibleUsers.map((user) => (
                <Avatar key={user.id} className={cn(sizeClasses[size], "border-2 border-background ring-0 rounded-full")}>
                    <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>
                        {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            ))}

            {remainingUsers > 0 && (
                <Avatar className={cn(sizeClasses[size], "border-2 border-background bg-muted text-muted-foreground ring-0 rounded-full text-xs")}>
                    <AvatarFallback>{remainingUsers}+</AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}
