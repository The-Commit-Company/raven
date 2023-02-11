import React from 'react';

interface Props {
    htmlString: string;
}

export const HtmlRenderer: React.FC<Props> = ({ htmlString }) => {
    return (
        <div dangerouslySetInnerHTML={{ __html: htmlString }} />
    )
}