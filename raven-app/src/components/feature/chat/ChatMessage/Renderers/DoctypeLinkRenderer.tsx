import { useToast } from "@/hooks/useToast"
import { Flex, IconButton, Link, Text } from "@radix-ui/themes"
import { BiLink, BiRightArrowAlt } from "react-icons/bi"
import { FiExternalLink } from "react-icons/fi"

const getRoute = (doctype: string, docname: string) => {
    const lowerCaseDoctype = doctype.toLowerCase().split(' ').join('-')
    const path = `/app/${lowerCaseDoctype}/${docname}`
    return path
}
export const DoctypeLinkRenderer = ({ doctype, docname }: { doctype: string, docname: string }) => {

    const { toast } = useToast()

    const copyLink = () => {

        navigator.clipboard.writeText(window.location.origin + getRoute(doctype, docname))

        toast({
            title: 'Link copied',
            duration: 800,
            variant: 'accent'
        })
    }

    const route = getRoute(doctype, docname)

    return (
        <Flex
            align='center'
            gap='4'
            mt={'1'}
            p='2'
            className="border-2 bg-gray-2 dark:bg-gray-4 rounded-md border-gray-4  dark:border-gray-6 shadow-sm">
            <Flex align='center' gap='2'>
                <BiRightArrowAlt />
                <Link size='2' underline="always" target="_blank" href={route}>Linked with {doctype}: {docname}</Link>
            </Flex>

            <Flex align='center' gap='2'>
                <IconButton
                    size={'1'}
                    title="Open in new tab"
                    color='gray'
                    asChild
                    variant="soft"
                >
                    <a href={route} target="_blank" rel="noreferrer">
                        <FiExternalLink />
                    </a>
                </IconButton>

                <IconButton
                    size='1'
                    title="Copy link"
                    color='gray'
                    onClick={copyLink}
                    variant="soft"
                >
                    <BiLink />
                </IconButton>
            </Flex>
        </Flex>
    )
}