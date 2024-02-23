import React, { memo } from 'react'
import { getFileExtension, getFileName, isVideoFile } from '../../../../../utils/operations'
import FileExtensionIcon from '../../../../common/FileExtensionIcon'

const FileMessageBlock = memo(({ message, user }) => {

    const fileExtension = getFileExtension(message.file)

    const fileName = getFileName(message.file)

    const isVideo = isVideoFile(fileExtension)

    const isPDF = fileExtension === 'pdf'

    if (isVideo) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    direction: "column",
                    gap: "4px",
                }}
            >
                <div>
                    <a
                        href={message.file}
                        target="_blank"
                        className="raven-message-image-link"
                        rel="noopener noreferrer"
                    >
                        {fileName}
                    </a>
                </div>
                <div>
                    <video src={message.file} controls width='320' style={{
                        borderRadius: "4px",
                    }}>

                    </video>
                </div>
            </div>
        )
    } else {
        return <div style={{
            display: 'flex',
            paddingTop: '8px',
            paddingBottom: '8px',
            flexDirection: 'row',
            alignContent: 'center',
            gap: '4px',
        }}>
            <FileExtensionIcon ext={fileExtension} size='18' />
            <a href={message.file} target={'_blank'}
                className="raven-message-image-link"
                rel="noopener noreferrer" style={{
                    lineClamp: '1',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                }}>
                {fileName}
            </a>
        </div>
    }


})

export default FileMessageBlock