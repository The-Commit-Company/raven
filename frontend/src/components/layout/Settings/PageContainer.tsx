import { Flex, FlexProps } from '@radix-ui/themes'

const PageContainer = (props: FlexProps) => {
    return (
        <Flex direction='column' gap='4' px='6' py='4' {...props} />
    )
}

export default PageContainer