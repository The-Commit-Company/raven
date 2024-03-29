import { Box, Checkbox, Flex, Text, RadioGroup, Button } from "@radix-ui/themes"
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
        <Box {...props} pt='1'>
            <ErrorBanner error={error} />
            {data && <PollMessageBox data={data} />}
        </Box>
    )
})

const PollMessageBox = ({ data }: { data: RavenPoll }) => {
    return (
        <Flex align='center' gap='4' p='2' className="bg-gray-2 
        shadow-sm
        dark:bg-gray-3
        group-hover:bg-accent-a2
        dark:group-hover:bg-gray-4  
        group-hover:transition-all
        group-hover:delay-100
        min-w-64 
        w-full
        rounded-md">
            <Flex direction='column' gap='2' p='2' className="w-full">
                <Text size='2' weight={'medium'}>{data.question}</Text>
                {data.is_multi_choice ? <MultiChoicePoll data={data} /> : <SingleChoicePoll data={data} />}
            </Flex>
        </Flex>
    )
}

const SingleChoicePoll = ({ data }: { data: RavenPoll }) => {
    return (
        <RadioGroup.Root>
            {data.options.map(option => (
                <div key={option.name}>
                    <Text as="label" size="2">
                        <Flex gap="2" p='2' className="rounded-sm hover:bg-accent-a2 dark:hover:bg-gray-5">
                            <RadioGroup.Item value={option.name} />
                            {option.option}
                        </Flex>
                    </Text>
                </div>
            ))}
        </RadioGroup.Root>
    )
}

const MultiChoicePoll = ({ data }: { data: RavenPoll }) => {
    return (
        <div>
            {data.options.map(option => (
                <div key={option.name}>
                    <Text as="label" size="2">
                        <Flex gap="2" p='2' className="rounded-sm hover:bg-accent-a2 dark:hover:bg-gray-5">
                            <Checkbox value={option.name} />
                            {option.option}
                        </Flex>
                    </Text>
                </div>
            ))}
            <Flex justify={'between'} align={'center'}>
                <Text size='1' className="text-gray-500">To view the poll results, please submit your choice(s)</Text>
                <Button size={'1'} variant={'soft'} style={{ alignSelf: 'flex-end' }}>Submit</Button>
            </Flex>
        </div>
    )
}