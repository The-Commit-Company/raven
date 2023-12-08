import { Box, Flex, Text } from '@radix-ui/themes';
import TiptapLink from '@tiptap/extension-link'
import { Editor, mergeAttributes } from "@tiptap/react";
import { useFrappeGetCall } from 'frappe-react-sdk';

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

export const LinkPreview = ({ editor }: { editor: Editor | null }) => {

    const href = editor?.getAttributes('link').href

    const { data, isLoading } = useFrappeGetCall<{ message: LinkPreviewDetails[] }>('raven.api.preview_links.get_preview_link', {
        urls: JSON.stringify([href])
    }, href ? undefined : null, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
    })

    if (!href) return null

    return <a href={href} target='_blank'>
        <Flex direction='column' gap='2' my='2'>
            {data?.message.map((linkPreview) => {
                if (linkPreview.image || linkPreview.absolute_image) {
                    return <Flex key={linkPreview.site_name} gap='4'>
                        <Box className='relative min-w-[18rem] min-h-[9rem] w-72 h-36'>
                            {/* Absolute positioned skeleton loader */}
                            <Box className='absolute top-0 z-0 left-0 w-72 h-36' >
                                <Box className='animate-pulse bg-gray-3 z-0 w-72 h-36 dark:bg-gray-5 rounded-md'>

                                </Box>
                            </Box>
                            <img
                                width='100%'
                                className='absolute object-cover min-w-[18rem] min-h-[9rem] w-72 h-36 rounded-md z-50 top-0 left-0'
                                src={linkPreview.image || linkPreview.absolute_image}
                                alt={linkPreview.title} />
                        </Box>
                        <Flex direction='column' gap='1' py='1' className='w-84'>
                            <Flex gap='1' direction='column'>
                                <Text as='span' weight='bold' size='5' className='cal-sans'>{linkPreview.title}</Text>
                                <Text as='span' color='gray' size='2' weight='medium'>{linkPreview.site_name}</Text>
                            </Flex>
                            <Text as='p' size='2' className='whitespace-break-spaces'>{linkPreview.description}</Text>
                        </Flex>
                    </Flex>
                } else {
                    return null
                }
            })
            }
        </Flex>
    </a>

}