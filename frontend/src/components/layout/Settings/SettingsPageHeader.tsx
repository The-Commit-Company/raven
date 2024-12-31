import { Badge, BadgeProps, Flex, Text } from '@radix-ui/themes'
import React from 'react'
import { HStack } from '../Stack'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../Breadcrumb'

type BreadcrumbItem = {
    label: React.ReactNode,
    href: string,
    copyToClipboard?: boolean
}

export type HeaderBadge = { label: string, color: BadgeProps['color'] }


type Props = {
    title: React.ReactNode,
    headerBadges?: HeaderBadge[],
    description?: React.ReactNode
    actions?: React.ReactNode,
    breadcrumbs?: BreadcrumbItem[]
}

const SettingsPageHeader = ({ title, description, actions, headerBadges, breadcrumbs }: Props) => {
    return (
        <Flex justify={'between'} align={'center'}>
            <Flex direction='column' className='gap-1'>
                {breadcrumbs ? <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((b, index) => <React.Fragment key={b.href}>
                            {index < breadcrumbs.length - 1 ? <>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={b.href}>{b.label}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                            </> :
                                <BreadcrumbPage copyToClipboard={b.copyToClipboard} value={b.label}>{b.label}</BreadcrumbPage>
                            }
                        </React.Fragment>)}
                    </BreadcrumbList>
                </Breadcrumb> : null}
                <HStack gap='2' align='center'>
                    <Text size='5' className={'font-semibold'}>{title}</Text>
                    {headerBadges?.map(badge => <Badge size='1' color={badge.color} key={badge.label}>{badge.label}</Badge>)}
                </HStack>
                {description && <Text size='2' color='gray'>{description}</Text>}
            </Flex>
            {actions}
        </Flex>
    )
}

export default SettingsPageHeader