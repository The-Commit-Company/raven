import { useDoctypePreview } from "@/hooks/useDoctypePreview"
import { Flex, Heading, IconButton, Tooltip } from "@radix-ui/themes"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { useContext } from "react"
import { Grid, Text, Box, Card } from "@radix-ui/themes"
import { toast } from "sonner"
import { BiCopy } from "react-icons/bi"
import { FiExternalLink } from "react-icons/fi"


export const DoctypeLinkRenderer = ({ doctype, docname }: { doctype: string, docname: string }) => {

    const { call } = useContext(FrappeContext) as FrappeConfig
    const { data, error, isLoading } = useDoctypePreview(doctype, docname)

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

    const removePreviewFields = (data: Record<string, any>) => {
        const fieldsToRemove = ['preview_image', 'preview_title', 'id']
        return Object.keys(data).reduce((acc, key) => {
            if (!fieldsToRemove.includes(key)) {
                acc[key as keyof typeof data] = data[key]
            }
            return acc
        }, {} as Record<string, any>)
    }

    const onCopyClick = () => {
        toast.promise(copyLink, {
            loading: 'Copying link...',
            success: 'Link copied!',
            error: 'Failed to copy link'
        })
    }

    const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)

    const copyLink = async () => {

        const route = await getRoute(doctype, docname)

        return navigator.clipboard.writeText(route)
    }

    const openLink = async () => {
        const route = await getRoute(doctype, docname)

        window.open(route, '_blank')
    }

    return (
        <Box className="max-w-[550px] min-w-[75px]">
            <Card>
                <Grid gap="2">
                    <Flex gap="4" align="center">
                        {
                            !data?.preview_image ?
                                <Box>
                                    <img
                                        src="https://images.unsplash.com/photo-1617050318658-a9a3175e34cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                                        alt="Bold typography"
                                        style={{
                                            objectFit: 'cover',
                                            width: '100%',
                                            minWidth: '50px',
                                            minHeight: '50px',
                                            maxWidth: '100px',
                                            maxHeight: '100px',
                                            backgroundColor: 'var(--gray-5)',
                                            borderRadius: 'var(--radius-4)'
                                        }}
                                    />
                                </Box>
                                : null
                        }
                        <Flex justify="between" className="flex-1">
                            <Grid gap="0">
                                <Heading as="h3" size="4">{data.preview_title}</Heading>
                                <Text
                                    size="2"
                                    color="gray"
                                    className="cursor-copy"
                                    onClick={() => copyToClipboard(data.id)}>
                                    {data.id}
                                </Text>
                            </Grid>
                            <Flex gap="2" align="center">
                                <Tooltip content="Open in new tab">
                                    <IconButton
                                        size={'1'}
                                        title="Open in new tab"
                                        color='gray'
                                        onClick={openLink}
                                        variant="soft"
                                    >
                                        <FiExternalLink />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip content="Copy link">
                                    <IconButton
                                        size='1'
                                        title="Copy link"
                                        color='gray'
                                        onClick={onCopyClick}
                                        variant="soft"
                                    >
                                        <BiCopy />
                                    </IconButton>
                                </Tooltip>
                            </Flex>
                        </Flex>
                    </Flex>

                    <Grid gap="2" >
                        {
                            Object.keys(removePreviewFields(data))?.map((item, index) => (
                                <Flex key={item + index} gap="4" align="center">
                                    <Flex>
                                        <Text
                                            size="2"
                                            weight="bold"
                                            color="gray"
                                        >
                                            {item}
                                        </Text>
                                    </Flex>
                                    <Flex gap="2" align="center">
                                        <Text
                                            size="2"
                                            className="cursor-copy"
                                            onClick={() => copyToClipboard(data[item])}
                                        >
                                            {data[item]}
                                        </Text>
                                    </Flex>
                                </Flex>
                            ))
                        }
                    </Grid>
                </Grid>
            </Card>
        </Box>
    )
}