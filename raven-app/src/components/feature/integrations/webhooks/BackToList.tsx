import { Flex, Text } from "@radix-ui/themes"
import { BiChevronLeft } from "react-icons/bi"
import { useNavigate } from "react-router-dom"

export const BackToList = () => {

    const navigate = useNavigate()

    return (
        <header>
            <Flex
                align='center'
                gap={'1'}
                className="cursor-pointer"
                onClick={() => navigate('/settings/integrations/webhooks')}
            >
                <BiChevronLeft size={'24px'} color="gray" />
                <Text as='span' size='2' color='gray' weight={'medium'}>Back to the list</Text>
            </Flex>
        </header>
    )
}