import { Avatar, Box, HStack, Skeleton, Stack } from "@chakra-ui/react"

export const ChatMessageLoader = () => {
    return (
        <Box pt='2' pb='1' px='2'>
            <HStack>
                <Avatar borderRadius={'md'} boxSize='36px' />
                <Stack spacing={1} width='full'>
                    <Skeleton height={'12px'} width={'100px'} />
                    <Skeleton height={'16px'} />
                </Stack>
            </HStack>
        </Box>
    )
}