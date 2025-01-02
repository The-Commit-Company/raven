import { Stack } from '@/components/layout/Stack';
import { Box, Card, IconButton, Text, Tooltip } from '@radix-ui/themes';
import { useCurrentEditor } from "@tiptap/react";
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import { memo, useMemo } from 'react';
import { BiX } from 'react-icons/bi';

export type LinkPreviewDetails = {
    title: string,
    description: string,
    image: string,
    force_title: string,
    absolute_image: string,
    site_name: string
}

const LinkPreview = memo(({ messageID }: { messageID: string }) => {

    const { editor } = useCurrentEditor()

    // We need to find the first mark of type link in a message and extract the href.

    const json = editor?.getJSON()

    const href = useMemo(() => {
        if (!json) return null

        let firstLink = ''

        // At every level of the json, we need to find the first mark of type link and extract the href.
        // Once we find the first link, we can stop searching.
        const findFirstLink = (json: any) => {
            if (firstLink) return firstLink

            if (Array.isArray(json)) {
                for (const item of json) {
                    if (typeof item === 'object') {
                        findFirstLink(item)
                    }
                }
            } else {
                if (json?.type === 'link') {
                    const link = json?.attrs?.href
                    if (link?.startsWith('mailto')) {
                    } else {
                        firstLink = json?.attrs?.href
                    }
                } else {
                    for (const key in json) {
                        if (typeof json?.[key] === 'object') {
                            findFirstLink(json?.[key])
                        }
                    }
                }
            }
        }

        findFirstLink(json)

        return firstLink
    }, [json])

    // const href = editor?.getAttributes('link').href


    const { data } = useFrappeGetCall<{ message: LinkPreviewDetails[] }>('raven.api.preview_links.get_preview_link', {
        urls: JSON.stringify([href])
    }, href ? `link_preview_${href}` : null, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
    })

    const { call } = useFrappePostCall('raven.api.preview_links.hide_link_preview')

    const hidePreviewLink = () => {
        call({
            message_id: messageID
        })
    }

    const linkPreview = data?.message?.[0]

    if (!href || !linkPreview) return null

    if (linkPreview && linkPreview.site_name && linkPreview.description) {

        const image = linkPreview.absolute_image || linkPreview.image
        return <Box pt='2' maxWidth={{
            md: '580px',
        }} position='relative' className='group/linkpreview sm:max-w-[580px] max-w-[356px]'>
            <Card asChild className='p-0 sm:p-3'>
                <a href={href} target='_blank' className='flex sm:items-center flex-col sm:flex-row sm:gap-4 gap-0 sm:pr-4'>
                    {image && <img src={image} alt={linkPreview.title}
                        className='sm:max-w-[220px] w-full h-full object-cover sm:object-center sm:h-auto sm:-ml-3 sm:-mt-3 sm:-mb-3'
                        style={{
                            display: "block",
                            backgroundColor: "var(--gray-5)",
                        }} />
                    }
                    <Stack className='gap-1.5 sm:p-0 py-3 px-3'>
                        <Stack className='sm:gap-1 gap-0.5'>
                            <Text weight='bold' className='block' size='2'>{linkPreview.title}</Text>
                            <Text size='1'>{linkPreview.site_name}</Text>
                        </Stack>
                        <Text as='p' size='1' className='line-clamp-3'>{linkPreview.description}</Text>
                    </Stack>
                </a>


            </Card>
            <div className='absolute top-4 right-2 z-10 group-hover/linkpreview:visible invisible sm:block hidden'>
                <Tooltip content='Hide link preview'>
                    <IconButton
                        size='1'
                        color='gray'
                        aria-label='Hide link preview'
                        className='bg-black/40 text-white rounded-md'
                        variant='ghost'
                        // variant='soft'
                        onClick={hidePreviewLink}
                    >
                        <BiX size='20' />
                    </IconButton>
                </Tooltip>
            </div>
        </Box>
    }

    return null

})

export default LinkPreview