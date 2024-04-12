import { Box, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes';
import TiptapLink from '@tiptap/extension-link'
import { mergeAttributes, useCurrentEditor } from "@tiptap/react";
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import { memo, useMemo } from 'react';
import { BiX } from 'react-icons/bi';

export const CustomLink = TiptapLink.extend({
    renderHTML({ HTMLAttributes }) {
        return [
            "a",
            mergeAttributes(HTMLAttributes, {
                class: 'rt-Text rt-reset rt-Link rt-underline-auto break-all'
            }), // mergeAttributes is a exported function from @tiptap/core
            0,
        ];
    },
}).configure({
    protocols: ['mailto', 'https', 'http'],
    openOnClick: false,
})
export type LinkPreviewDetails = {
    title: string,
    description: string,
    image: string,
    force_title: string,
    absolute_image: string,
    site_name: string
}

export const LinkPreview = memo(({ messageID }: { messageID: string }) => {

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
        revalidateIfStale: false,
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

    if (!href) return null

    const linkPreview = data?.message?.[0]

    return <Flex direction='column' gap='2' py='2'>
        {linkPreview ? linkPreview.site_name && linkPreview.description ? <Flex gap='4'>
            {(linkPreview.absolute_image || linkPreview.image) &&
                <a href={href} target='_blank'>
                    <Box className='relative min-w-64 min-h-32 w-64 h-32'>
                        {/* Absolute positioned skeleton loader */}
                        <Box className='absolute top-0 z-0 left-0 w-64 h-32' >
                            <Box className='animate-pulse bg-gray-3 z-0 w-64 h-32 dark:bg-gray-5 rounded-md'>

                            </Box>
                        </Box>
                        <img
                            width='100%'
                            className='absolute object-cover min-w-64 min-h-32 w-64 h-32 rounded-md z-50 top-0 left-0'
                            src={linkPreview.absolute_image || linkPreview.image}
                            alt={linkPreview.title} />
                    </Box>
                </a>
            }
            <Flex className='group'>
                <a href={href} target='_blank'>

                    <Flex direction='column' gap='1' py='1' className='w-84'>
                        <Flex gap='1' direction='column'>
                            <Text as='span' weight='bold' size='3'>{linkPreview.title}</Text>
                            <Text as='span' color='gray' size='2' weight='medium'>{linkPreview.site_name}</Text>
                        </Flex>
                        <Text as='p' size='2' className='whitespace-break-spaces'>{linkPreview.description}</Text>
                    </Flex>
                </a>
                <div className='group-hover:visible invisible'>
                    <Tooltip content='Hide link preview'>
                        <IconButton size='1'
                            color='gray'
                            className='cursor-pointer'
                            aria-label='Hide link preview'
                            variant='soft'
                            onClick={hidePreviewLink}
                        >
                            <BiX size='20' />
                        </IconButton>
                    </Tooltip>
                </div>
            </Flex>
        </Flex> : null :

            null
        }
    </Flex >

})