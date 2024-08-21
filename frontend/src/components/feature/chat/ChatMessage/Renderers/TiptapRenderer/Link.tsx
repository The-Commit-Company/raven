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
        return <Box py='2'>
            <Flex className='gap-2 sm:gap-4 sm:flex-start items-center' width='100%'>
                {(linkPreview.absolute_image || linkPreview.image) &&
                    <a href={href} target='_blank'>
                        <Box className='relative w-18 min-w-20 min-h-12 h-12 sm:min-w-64 sm:min-h-32 sm:w-64 sm:h-32'>
                            {/* Absolute positioned skeleton loader */}
                            <Box className='absolute top-0 z-0 left-0 w-20 h-12 sm:w-64 sm:h-32' >
                                <Box className='animate-pulse bg-gray-3 z-0 w-20 h-12 sm:w-64 sm:h-32 dark:bg-gray-5 rounded-md'>

                                </Box>
                            </Box>
                            <img
                                width='100%'
                                className='absolute object-cover min-w-20 sm:min-w-64 min-h-12 sm:min-h-32 w-20 sm:w-64 h-12 sm:h-32 rounded-md z-50 top-0 left-0'
                                src={linkPreview.absolute_image || linkPreview.image}
                                alt={linkPreview.title} />
                        </Box>
                    </a>
                }
                <Flex className='group sm:pr-2 sm:gap-2 gap-0' width='100%'>
                    <a href={href} target='_blank' className='block w-full'>

                        <Flex direction='column' gap='1' className='sm:py-1'>
                            <Flex gap='1' className='sm:flex-col flex-col-reverse'>
                                <Text as='span' weight='bold' className='sm:text-base text-xs'>{linkPreview.title}</Text>
                                <Text as='span' color='gray' weight='medium' className='sm:text-md text-xs'>{linkPreview.site_name}</Text>
                            </Flex>
                            <Text as='p' size='1' className='whitespace-break-spaces sm:block hidden'>{linkPreview.description}</Text>
                        </Flex>
                    </a>
                    <div className='group-hover:visible invisible sm:block hidden'>
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
            </Flex>
        </Box>
    }

    return null

})