import { useDoctypePreview } from "@/hooks/useDoctypePreview"
import { Flex, Heading, IconButton, Skeleton, Tooltip } from "@radix-ui/themes"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { useContext } from "react"
import { Grid, Text, Box, Card } from "@radix-ui/themes"
import { toast } from "sonner"
import { BiCopy, BiLinkExternal } from "react-icons/bi"


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

    const copyLink = async () => {

        const route = await getRoute(doctype, docname)

        return navigator.clipboard.writeText(route)
    }

    const openLink = async () => {
        const route = await getRoute(doctype, docname)

        window.open(route, '_blank')
    }

    return (
        <Box className='max-w-[550px] min-w-[75px]'>
            {
                isLoading ?
                    <Skeleton className='w-96 h-12 rounded-md' /> :
                    error ?
                        <Card>
                            <Grid gap='2' align='center'>
                                <Heading as='h3' size='4'>Error occurred while loading Doctype</Heading>
                                <Text
                                    size='2'
                                    color='gray'
                                >
                                    {error.message}
                                </Text>
                            </Grid>
                        </Card> :
                        <DoctypeCard data={data} copyLink={copyLink} openLink={openLink} />
            }
        </Box>
    )
}


const DoctypeCard = ({ data, copyLink, openLink }: { data: Record<string, any>, copyLink: () => Promise<void>, openLink: () => Promise<void> }) => {

    // utility func to remove known preview fields in order to map rest of them
    const removePreviewFields = (data: Record<string, any>) => {
        const fieldsToRemove = ['preview_image', 'preview_title', 'id']
        return Object.keys(data).reduce((acc, key) => {
            if (!fieldsToRemove.includes(key)) {
                acc[key as keyof typeof data] = data[key]
            }
            return acc
        }, {} as Record<string, any>)
    }

    const onCopyLinkClick = () => {
        toast.promise(copyLink, {
            loading: 'Copying link...',
            success: 'Link copied!',
            error: 'Failed to copy link'
        })
    }

    const onCopyTextClick = (item: string) => {
        toast.promise(() => copyToClipboard(data[item]), {
            loading: `Copying ${item}...`,
            success: `${item} copied!`,
            error: `Failed to copy ${item}`,
            duration: 1000
        })
    }

    const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)

    return (
        <Card>
            <Grid gap='2'>
                <Flex gap='4' align='center'>
                    {
                        data?.preview_image &&
                        <Box>
                            <img
                                src={data.preview_image}
                                alt={data?.preview_title}
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
                    }
                    <Flex justify='between' className='flex-1'>
                        <Grid gap='0'>
                            <Heading as='h3' size='4'>{data?.preview_title}</Heading>
                            <Text
                                size='2'
                                color='gray'
                                className='cursor-copy'
                                onClick={() => onCopyTextClick('ID')}
                            >
                                {data?.id}
                            </Text>
                        </Grid>
                        <Flex gap='2' align='center'>
                            <Tooltip content='Open in new tab'>
                                <IconButton
                                    size='1'
                                    title='Open in new tab'
                                    color='gray'
                                    onClick={openLink}
                                    variant='soft'
                                >
                                    <BiLinkExternal />
                                </IconButton>
                            </Tooltip>

                            <Tooltip content='Copy link'>
                                <IconButton
                                    size='1'
                                    title='Copy link'
                                    color='gray'
                                    onClick={onCopyLinkClick}
                                    variant='soft'
                                >
                                    <BiCopy />
                                </IconButton>
                            </Tooltip>
                        </Flex>
                    </Flex>
                </Flex>

                <Grid gap='2' >
                    {
                        data && Object.keys(removePreviewFields(data))?.map((item, index) => (
                            <Flex key={item + index} gap='4' align='center'>
                                <Flex>
                                    <Text
                                        size='2'
                                        weight='bold'
                                        color='gray'
                                    >
                                        {item}
                                    </Text>
                                </Flex>
                                <Flex gap='2' align='center'>
                                    <Text
                                        size='2'
                                        className='cursor-copy'
                                        onClick={() => onCopyTextClick(item)}
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
    )
}