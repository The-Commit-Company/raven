import { Box } from "@radix-ui/themes"
import { BoxProps } from "@radix-ui/themes/dist/cjs/components/box"

function Skeleton({
    className,
    ...props
}: BoxProps) {
    return (
        <Box
            className={"animate-pulse rounded-md bg-muted " + className}
            {...props}
        />
    )
}

export { Skeleton }