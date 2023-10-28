import { Heading } from "@radix-ui/themes"
import { HeadingProps } from "@radix-ui/themes/dist/cjs/components/heading"
import { PropsWithChildren } from "react"

export const PageHeading = ({ children, ...props }: PropsWithChildren<HeadingProps>) => {
    return (
        <Heading size='6' {...props}>{children}</Heading>
    )
}