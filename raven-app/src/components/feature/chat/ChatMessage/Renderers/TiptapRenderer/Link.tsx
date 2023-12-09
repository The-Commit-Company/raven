import { Skeleton } from '@/components/common/Skeleton';
import { Box, Flex, Text } from '@radix-ui/themes';
import TiptapLink from '@tiptap/extension-link'
import { mergeAttributes, useCurrentEditor } from "@tiptap/react";
import { useFrappeGetCall } from 'frappe-react-sdk';
import { memo, useMemo } from 'react';

export const CustomLink = TiptapLink.extend({
    renderHTML({ HTMLAttributes }) {
        return [
            "a",
            mergeAttributes(HTMLAttributes, {
                class: 'rt-Text rt-reset rt-Link rt-underline-auto break-all line-clamp-3'
            }), // mergeAttributes is a exported function from @tiptap/core
            0,
        ];
    },
}).configure({
    protocols: ['mailto', 'https', 'http']
})

export type LinkPreviewDetails = {
    title: string,
    description: string,
    image: string,
    force_title: string,
    absolute_image: string,
    site_name: string
}

export const LinkPreview = memo(({ isScrolling }: { isScrolling?: boolean }) => {

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

    // console.log(editor?.state)

    const { data, isLoading } = useFrappeGetCall<{ message: LinkPreviewDetails[] }>('raven.api.preview_links.get_preview_link', {
        urls: JSON.stringify([href])
    }, href ? undefined : null, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
    })

    if (!href) return null

    const linkPreview = data?.message?.[0]

    return <a href={href} target='_blank'>
        <Flex direction='column' gap='2' py='2'>
            {linkPreview ? linkPreview.site_name ? <Flex gap='4'>
                <Box className='relative min-w-[18rem] min-h-[9rem] w-72 h-36'>
                    {/* Absolute positioned skeleton loader */}
                    <Box className='absolute top-0 z-0 left-0 w-72 h-36' >
                        <Box className='animate-pulse bg-gray-3 z-0 w-72 h-36 dark:bg-gray-5 rounded-md'>

                        </Box>
                    </Box>
                    {(linkPreview.absolute_image || linkPreview.image) &&
                        <img
                            width='100%'
                            className='absolute object-cover min-w-[18rem] min-h-[9rem] w-72 h-36 rounded-md z-50 top-0 left-0'
                            src={linkPreview.absolute_image || linkPreview.image}
                            alt={linkPreview.title} />
                    }
                </Box>
                <Flex direction='column' gap='1' py='1' className='w-84'>
                    <Flex gap='1' direction='column'>
                        <Text as='span' weight='bold' size='5' className='cal-sans'>{linkPreview.title}</Text>
                        <Text as='span' color='gray' size='2' weight='medium'>{linkPreview.site_name}</Text>
                    </Flex>
                    <Text as='p' size='2' className='whitespace-break-spaces'>{linkPreview.description}</Text>
                </Flex>
            </Flex> : null :

                <Flex gap='4'>
                    <Box className='relative min-w-[18rem] min-h-[9rem] w-72 h-36'>
                        {/* Absolute positioned skeleton loader */}
                        <Box className='absolute top-0 z-0 left-0 w-72 h-36' >
                            <Box className='animate-pulse bg-gray-3 z-0 w-72 h-36 dark:bg-gray-5 rounded-md'>

                            </Box>
                        </Box>
                    </Box>
                    <Flex direction='column' gap='1' py='1' className='w-84'>
                        <Flex gap='1' direction='column'>
                            <Text as='span' weight='bold' size='5' className='cal-sans'><Skeleton className='w-48 h-6' /></Text>
                            <Text as='span' color='gray' size='2' weight='medium'><Skeleton className='w-64 h-4' /></Text>
                        </Flex>
                        <Text as='p' size='2' className='whitespace-break-spaces line-clamp-2'>{isScrolling ?
                            <Flex direction='column' gap='1' pt='2'>
                                <Skeleton className='h-2 w-72' />
                                <Skeleton className='h-2 w-96' />
                            </Flex>

                            : href}</Text>
                    </Flex>
                </Flex>}
        </Flex>
    </a>

})