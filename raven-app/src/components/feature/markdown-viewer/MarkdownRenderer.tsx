import React from 'react';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './MarkdownRenderer.css'
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Box, Text, Image, HStack, Stack, useColorMode, IconButton, useClipboard } from '@chakra-ui/react';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';

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

  const LinkURL = urls[0]

  const { data } = useFrappeGetCall<{ message: LinkPreviewDetails }>('raven.api.preview_links.get_preview_link', {
    url: LinkURL ? LinkURL : ''
  })

  const { colorMode } = useColorMode()
  const borderColor = colorMode === 'light' ? 'gray.900' : 'gray.400'

  const { onCopy, hasCopied } = useClipboard("")

  return <>

    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      className="markdown"
      components={{
        pre: ({ node, ...props }) => <Box position="relative" p={0} width={'calc(100vw - var(--sidebar-width) - var(--chakra-space-16) - 36px)'}>
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
            icon={hasCopied ? <CheckIcon color={'green.500'} fontSize={'0.6rem'} /> : <CopyIcon />}
            onClick={() => {
              navigator.clipboard.writeText(content.replace(/<[^>]*>?/gm, '').trim())
              onCopy()
            }} />
          <Box as="pre" {...props} />
        </Box>
      }}>
      {content}
    </ReactMarkdown>

    {data && data.message && (data.message.image || data.message.absolute_image) && <Box py={3}>
      <Box px={3} maxW="50vw" borderLeft="2px" borderColor={borderColor} borderRadius="sm">
        <HStack alignItems="self-start">
          <Image
            src={data.message.image ? data.message.image : data.message.absolute_image}
            alt={`${data.message.title} website image`}
            boxSize="8rem"
            objectFit="cover"
            borderRadius="md"
            mr={3}
          />
          <Stack spacing={1}>
            <Text fontWeight="bold">{data.message.title}</Text>
            <Text fontSize="sm" fontWeight="normal" color={'gray.500'}>
              {data.message.description}
            </Text>
          </Stack>
        </HStack>
      </Box>
    </Box>}

  </>
}