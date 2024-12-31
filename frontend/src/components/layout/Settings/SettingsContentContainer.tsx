import { Flex, FlexProps } from '@radix-ui/themes'

const SettingsContentContainer = (props: FlexProps) => {
    return (
        <Flex direction={'column'} gap='4' {...props} />
    )
}

export default SettingsContentContainer