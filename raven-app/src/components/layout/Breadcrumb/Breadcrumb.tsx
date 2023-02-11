import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Text
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'

interface PageLink {
    name: string,
    url: string,
    isCurrent?: boolean
}
interface Props {
    pages?: PageLink[],
}

export const BreadCrumb = ({ pages }: Props) => {

    return (
        <Breadcrumb
            display='flex'
            separator={<ChevronRightIcon boxSize='6' color='gray.500' />}>

            {pages && pages.map(({ name, url, isCurrent }) => <BreadcrumbItem isCurrentPage={isCurrent} key={url}>
                <BreadcrumbLink fontWeight='semibold' color={isCurrent ? 'gray.800' : 'blue.500'} fontSize='sm' href={url}>
                    <Text color={isCurrent ? 'gray.800' : 'blue.500'}>
                        {name}
                    </Text>
                </BreadcrumbLink>
            </BreadcrumbItem>)}

        </Breadcrumb>
    )
}