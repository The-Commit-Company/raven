import { Flex, VStack, Text, HStack, Link } from "@chakra-ui/react"

export const EmptyStateForSearch = () => {

    return (
        <Flex justify="center" align="center" height="50vh" width="full">
            <VStack>
                <Text fontWeight="bold" align="center" fontSize='md'>Nothing turned up</Text>
                <Text align="center" w="30vw" fontSize='sm'>You may want to try using different keywords, checking for typos or adjusting your filters.</Text>
                <HStack spacing={1}>
                    <Text fontSize='xs'>Not the results that you expected? File an issue on</Text>
                    <Link href="https://github.com/The-Commit-Company/Raven" target="_blank" rel="noreferrer">
                        <Text color='blue.500' fontSize='xs'>GitHub.</Text>
                    </Link>.
                </HStack>
            </VStack>
        </Flex>
    )
}