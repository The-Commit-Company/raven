import { Box, Checkbox, Flex, Text, RadioGroup } from "@radix-ui/themes"
import { BoxProps } from "@radix-ui/themes/dist/cjs/components/box"
import { memo } from "react"
import { UserFields } from "../../../../../utils/users/UserListProvider"
import { PollMessage } from "../../../../../../../types/Messaging/Message"
import { useFrappeGetDoc } from "frappe-react-sdk"
import { RavenPoll } from "@/types/RavenMessaging/RavenPoll"
import { ErrorBanner } from "@/components/layout/AlertBanner"

interface PollMessageBlockProps extends BoxProps {
    message: PollMessage,
    user?: UserFields,
}

export const PollMessageBlock = memo(({ message, user, ...props }: PollMessageBlockProps) => {

    // fetch poll data using message.poll_id
    const { data, error } = useFrappeGetDoc<RavenPoll>('Raven Poll', message.poll_id)

    return (
        <Box {...props} pt='2'>
            <ErrorBanner error={error} />
            {data && <PollMessageBox data={data} />}
        </Box>
    )
})

const PollMessageBox = ({ data }: { data: RavenPoll }) => {
    return (
        <Flex align='center' gap='4' p='2' className="bg-gray-2 dark:bg-gray-3 rounded-md">
            <Flex direction='column' gap='2' p='2'>
                <Text size='3' weight={'medium'}>{data.question}</Text>
                <RadioGroup.Root>
                    {data.options.map(option => (
                        <div key={option.name}>
                            <Text as="label" size="2">
                                <Flex gap="2" p='1'>
                                    {data.is_multi_choice ? <Checkbox value={option.name} /> : <RadioGroup.Item value={option.name} />}
                                    {option.option}
                                </Flex>
                            </Text>
                        </div>
                    ))}
                </RadioGroup.Root>
            </Flex>
        </Flex>
    )
}