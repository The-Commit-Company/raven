import { Heading, HeadingProps } from "@chakra-ui/react"
import { PropsWithChildren } from "react"

export const PageHeading = ({ children, ...props }: PropsWithChildren<HeadingProps>) => {
    return (
        <Heading as='h1' size='md' fontWeight='semibold' {...props}>{children}</Heading>
    )
}