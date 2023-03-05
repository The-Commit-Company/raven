import React, { useEffect } from 'react';
import { Remark, useRemark, useRemarkSync, UseRemarkSyncOptions } from 'react-remark';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';


interface Props {
  content: string;
}

export const MarkdownRenderer: React.FC<Props> = ({ content }) => {

  return <Remark
    remarkToRehypeOptions={{ allowDangerousHtml: true }}
    rehypePlugins={[rehypeRaw, rehypeSanitize] as UseRemarkSyncOptions['rehypePlugins']}
  >{content}</Remark>
}