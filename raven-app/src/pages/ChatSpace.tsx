import { Stack } from "@chakra-ui/react"
import { useParams } from "react-router-dom"
import { ChatInterface } from "../components/feature/chat"
import { PageHeader } from "../components/layout/Heading/PageHeader"
import { PageHeading } from "../components/layout/Heading/PageHeading"

type Props = {}

export const ChatSpace = (props: Props) => {

    const { channelID } = useParams()

    return (
        <Stack spacing={4}>
            <PageHeader>
                <PageHeading>{channelID}</PageHeading>
            </PageHeader>
            <ChatInterface />
        </Stack>
    )
}