import { Box } from "@radix-ui/themes"
import { BoxProps } from "@radix-ui/themes/dist/cjs/components/box"

function Skeleton({
    className,
    ...props
}: BoxProps) {
    return (
        <Box
            {...props}
            className={"animate-pulse rounded-md bg-slate-6 " + className}
        >
        </Box>
    )
}

export { Skeleton }