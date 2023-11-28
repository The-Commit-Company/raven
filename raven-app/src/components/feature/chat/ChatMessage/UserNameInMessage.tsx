import { DateTooltip } from "./DateTooltip"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { useTheme } from "@/ThemeProvider"
import { Flex, Separator, Text } from "@radix-ui/themes"

interface UserNameInMessageProps {
    timestamp: string,
    user: string,
}

export const UserNameInMessage = ({ timestamp, user }: UserNameInMessageProps) => {

    const { appearance } = useTheme()
    const textColor = appearance === 'light' ? 'gray.800' : 'gray.50'

    const users = useGetUserRecords()

    return (
        <Flex gap='2' align='start'>
            <Text
                size='2'
                weight="bold"
                className="leading-3"
                as='span'
            >
                {users?.[user]?.full_name ?? user}
            </Text>
            <Separator orientation="vertical" />
            <DateTooltip timestamp={timestamp} />
        </Flex>
    )
}