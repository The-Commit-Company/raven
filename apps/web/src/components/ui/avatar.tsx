import * as React from "react"

import { cn } from "@lib/utils"

type ImageStatus = "loading" | "loaded" | "error"

// Lets the fallback know whether the image has painted, so it can get out of
// the way. Transparent logos would otherwise show the initials through them.
const AvatarContext = React.createContext<{
  status: ImageStatus
  setStatus: (status: ImageStatus) => void
}>({ status: "loading", setStatus: () => {} })

function Avatar({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const [status, setStatus] = React.useState<ImageStatus>("loading")
  return (
    <AvatarContext.Provider value={{ status, setStatus }}>
      <span
        data-slot="avatar"
        className={cn(
          "relative isolate flex size-8 shrink-0 overflow-hidden",
          className
        )}
        {...props}
      />
    </AvatarContext.Provider>
  )
}

/**
 * A plain <img>. It is in the DOM from the first render, so the browser
 * paints a cached image in the same frame and retries a failed one on the
 * next mount. A failed image is hidden rather than removed. Removing it
 * would remount it and request the same URL again.
 */
function AvatarImage({
  className,
  src,
  alt = "",
  onLoad,
  onError,
  ...props
}: React.ComponentProps<"img">) {
  const { status, setStatus } = React.useContext(AvatarContext)
  const ref = React.useRef<HTMLImageElement>(null)

  // Every new src starts over. A cached image can be complete before this
  // effect runs, so read the element instead of relying on the load event.
  React.useEffect(() => {
    if (!src) return
    const image = ref.current
    setStatus(image?.complete && image.naturalWidth > 0 ? "loaded" : "loading")
    return () => setStatus("loading")
  }, [src, setStatus])

  if (!src) return null

  return (
    <img
      ref={ref}
      data-slot="avatar-image"
      src={src}
      alt={alt}
      hidden={status === "error"}
      className={cn("aspect-square size-full object-cover object-center", className)}
      onLoad={(event) => {
        setStatus("loaded")
        onLoad?.(event)
      }}
      onError={(event) => {
        setStatus("error")
        onError?.(event)
      }}
      {...props}
    />
  )
}

/** Shown behind the image until it has painted, and on its own when there is no image. */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { status } = React.useContext(AvatarContext)
  if (status === "loaded") return null
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "bg-surface-gray-2 text-ink-gray-5 absolute inset-0 -z-10 flex items-center justify-center rounded-full select-none",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
