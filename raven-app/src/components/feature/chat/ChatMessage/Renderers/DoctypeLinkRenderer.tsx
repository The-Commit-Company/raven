import { Flex, IconButton, Link } from "@radix-ui/themes"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { useContext } from "react"
import { BiLink, BiRightArrowAlt } from "react-icons/bi"
import { FiExternalLink } from "react-icons/fi"
import { toast } from "sonner"


export const DoctypeLinkRenderer = ({ doctype, docname }: { doctype: string, docname: string }) => {

    const { call } = useContext(FrappeContext) as FrappeConfig

    const getRoute = async (doctype: string, docname: string): Promise<string> => {


        // @ts-expect-error
        if (window.frappe.boot.raven_document_link_override) {
            return call.get('raven.api.document_link.get', {
                doctype,
                docname
            }).then(res => res.message)

        } else {
            const lowerCaseDoctype = doctype.toLowerCase().split(' ').join('-')
            return Promise.resolve(`${window.location.origin}/app/${lowerCaseDoctype}/${docname}`)
        }

    }

    const onCopyClick = () => {
        toast.promise(copyLink, {
            loading: 'Copying link...',
            success: 'Link copied!',
            error: 'Failed to copy link'
        })
    }

    const copyLink = async () => {

        const route = await getRoute(doctype, docname)

        return navigator.clipboard.writeText(route)
    }

    const openLink = async () => {
        const route = await getRoute(doctype, docname)

        window.open(route, '_blank')
    }

    return (
        <Flex
            align='center'
            gap='4'
            mt={'1'}
            p='2'
            className="border-2 bg-gray-2 dark:bg-gray-4 rounded-md border-gray-4  dark:border-gray-6 shadow-sm">
            <Flex align='center' gap='2'>
                <BiRightArrowAlt />
                <Link size='2' underline="always" onClick={openLink}>{doctype}: {docname}</Link>
            </Flex>

            <Flex align='center' gap='2'>
                <IconButton
                    size={'1'}
                    title="Open in new tab"
                    color='gray'
                    onClick={openLink}
                    variant="soft"
                >
                    <FiExternalLink />
                </IconButton>

                <IconButton
                    size='1'
                    title="Copy link"
                    color='gray'
                    onClick={onCopyClick}
                    variant="soft"
                >
                    <BiLink />
                </IconButton>
            </Flex>
        </Flex>
    )
}