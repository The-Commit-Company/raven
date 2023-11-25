import React from 'react';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './MarkdownRenderer.css'
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Box, Text, Image, HStack, Stack, IconButton, useClipboard } from '@chakra-ui/react';
import { Check, Copy } from 'lucide-react';
import { useTheme } from '@/ThemeProvider';

interface Props {
  content: string
}

export type LinkPreviewDetails = {
  title: string,
  description: string,
  image: string,
  force_title: string,
  absolute_image: string,
  site_name: string
}

export const MarkdownRenderer: React.FC<Props> = ({ content }) => {

  const regex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g
  const urls = []

  let match
  while ((match = regex.exec(content)) !== null) {
    urls.push(match[2])
  }

  const { data } = useFrappeGetCall<{ message: LinkPreviewDetails[] }>('raven.api.preview_links.get_preview_link', {
    urls: JSON.stringify(urls)
  }, urls.length > 0 ? undefined : null, {
    revalidateOnFocus: false
  })

  const { appearance } = useTheme()
  const borderColor = appearance === 'light' ? 'gray.900' : 'gray.400'

  const { onCopy, hasCopied } = useClipboard("")

  return <>

    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      className="markdown"
      components={{
        pre: ({ node, ...props }) => <Box position="relative" p={0} width={'calc(100vw - var(--sidebar-width) - var(--chakra-space-16) - 64px)'}>
          <IconButton
            zIndex={1}
            variant={'outline'}
            color={'gray.400'}
            borderColor={'gray.600'}
            position="absolute"
            _hover={{ bg: 'gray.700', color: 'white' }}
            top="2"
            right="2"
            aria-label="copy"
            size="xs"
            icon={hasCopied ? <Check color={'green'} size='16' /> : <Copy size='16' />}
            onClick={() => {
              navigator.clipboard.writeText(content.replace(/<[^>]*>?/gm, '').trim())
              onCopy()
            }} />
          <Box as="pre" {...props} />
        </Box>
      }}>
      {content}
    </ReactMarkdown>

    {data?.message && data.message.map((link, i) => (
      (link.image || link.absolute_image) &&
      <Box py={3} key={i}>
        <Box px={3} maxW="50vw" borderLeft="2px" borderColor={borderColor} borderRadius="sm">
          <HStack alignItems="self-start">
            <Image
              src={link.image ? link.image : link.absolute_image}
              alt={`${link.title} website image`}
              boxSize="8rem"
              objectFit="cover"
              borderRadius="md"
              mr={3}
            />
            <Stack spacing={1}>
              <Text fontWeight="bold">{link.title}</Text>
              {link.description && <Text fontSize="sm" fontWeight="normal" color={'gray.500'}>
                {link.description.length > 200 ? link.description.substring(0, 200) + '...' : link.description}
              </Text>}
            </Stack>
          </HStack>
        </Box>
      </Box>))}
  </>
}