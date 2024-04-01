import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import "./avatar.css";
import { cn } from "@/lib/utils"
import { getAvatarColor, getFallbackInitials } from "@/utils/ui/avatar"


const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-md",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full rounded-md", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-lg",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName


interface CustomAvatarProps {
  src?: string,
  alt: string,
  slot?: string,
  isActive?: boolean,
  sizeClass?: string,
}


const CustomAvatar = ({ src, alt, slot, sizeClass = 'w-8 h-8', isActive, ...props }: CustomAvatarProps) => {
  return <span className="relative inline-block">
    <Avatar className={`${sizeClass}`} >
      <AvatarImage src={src} />
      <AvatarFallback className={getAvatarColor(alt)} >{getFallbackInitials(alt)}</AvatarFallback>
    </Avatar>
    {isActive &&
      <span className="absolute bottom-0.5 right-0.5 block translate-x-1/2 translate-y-1/2 transform rounded-md">
        <span className="block h-2 w-2 rounded-lg shadow-md bg-green-600" />
      </span>
    }
  </span>
}
CustomAvatar.displayName = CustomAvatar

export { Avatar, AvatarImage, AvatarFallback, CustomAvatar }
