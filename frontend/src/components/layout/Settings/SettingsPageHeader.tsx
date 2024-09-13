import { Flex, Text } from '@radix-ui/themes'
import React from 'react'

type Props = {
    title: React.ReactNode
    description?: React.ReactNode
    actions?: React.ReactNode
}

const SettingsPageHeader = (props: Props) => {
    return (
        <Flex justify={'between'} align={'center'}>
            <Flex direction='column' className='gap-0.5'>
                <Text size='3' className={'font-semibold'}>{props.title}</Text>
                {props.description && <Text size='2' color='gray'>{props.description}</Text>}
            </Flex>
            {props.actions}
        </Flex>
    )
}

export default SettingsPageHeader