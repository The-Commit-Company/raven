import React from 'react';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './MarkdownRenderer.css'
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Box, Text, Image, HStack, Stack, useColorMode } from '@chakra-ui/react';

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
    url: LinkURL
  })

  const { colorMode } = useColorMode()
  const borderColor = colorMode === 'light' ? 'gray.900' : 'gray.400'

  return <>

    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      className="markdown">
      {content}
    </ReactMarkdown>

    {data && data.message && <Box py={3}>
      <Box px={3} maxW="50vw" borderLeft="2px" borderColor={borderColor} borderRadius="sm">
        <HStack alignItems="self-start">
          <Image
            src={data.message.image}
            alt={`${data.message.title} website image`}
            boxSize="8rem"
            objectFit="cover"
            borderRadius="md"
            mr={3}
          />
          <Stack spacing={1}>
            <Text fontWeight="bold">{data.message.title}</Text>
            <Text fontSize="sm" fontWeight="normal">
              {data.message.description}
            </Text>
          </Stack>
        </HStack>
      </Box>
    </Box>}

  </>
}