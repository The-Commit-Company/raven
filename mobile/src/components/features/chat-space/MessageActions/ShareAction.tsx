import { downloadOutline, shareOutline } from 'ionicons/icons';
import { ActionIcon, ActionItem, ActionLabel, ActionProps } from './common'
import { useIonToast } from '@ionic/react';
import turndown from 'turndown'
import { useState } from 'react';
import { getFileName } from '@/utils/operations/operations';

export const ShareAction = ({ message, onSuccess }: ActionProps) => {

    return <ShareActionItem message={message} onSuccess={onSuccess} />
}

const ShareActionItem = ({ message, onSuccess }: ActionProps) => {

    const [present] = useIonToast();

    const [loading, setLoading] = useState(false)

    const downloadFile = async (url: string) => {

        console.log("Downloading file", url)
        return fetch(url, { method: 'get', referrerPolicy: 'no-referrer' })
            .then(res => res.blob())
            .catch((e) => {
                present({
                    color: 'danger',
                    duration: 600,
                    message: "Error: Could not download file - " + e.message || "Unknown Error",
                })
                setLoading(false)

                return null
            })
    }

    // Feature detection
    const webShareSupported = 'canShare' in navigator;

    const shareMessage = async () => {
        setLoading(true)

        const shareOptions: any = {}

        // If the message is a file, we need to download it first
        let blob: Blob | null = null
        if (message.data.message_type === 'Image' || message.data.message_type === 'File') {

            blob = await downloadFile(message.data.file)
        }

        if (webShareSupported) {
            if (message.data.message_type === 'Image' || message.data.message_type === 'File') {

                const fileName = getFileName(message.data.file)

                if (blob) {
                    shareOptions.files = [
                        new File([blob], fileName, {
                            type: blob.type,
                        }),
                    ]
                    shareOptions.title = fileName
                    shareOptions.text = fileName
                }
            } else if (message.data.message_type === 'Text') {
                let text = message.data.text

                // Remove all empty lines
                text = text.replace(/^\s*[\r\n]/gm, "")

                var turndownService = new turndown({
                    codeBlockStyle: 'fenced',
                })

                // We want the links to not be converted to markdown links

                turndownService.addRule('links', {
                    filter: 'a',
                    replacement: function (content, node, options) {
                        return content
                    }
                })
                var markdown = turndownService.turndown(text)

                shareOptions.text = markdown
            }

            if (shareOptions.files || shareOptions.text) {

                if (navigator.canShare(shareOptions)) {
                    return navigator.share(shareOptions)
                        .then(() => present({
                            position: 'bottom',
                            color: 'primary',
                            duration: 600,
                            message: 'Shared!',
                        }))
                        .then(() => setLoading(false))
                        .then(() => onSuccess())
                        .catch((e) => {
                            present({
                                color: 'danger',
                                duration: 600,
                                message: "Error: Could not share - " + e.message || "Unknown Error",
                            })
                            setLoading(false)
                        })
                }
            }
        }
        if (message.data.message_type === 'Image' || message.data.message_type === 'File') {
            if (blob) {
                // Fallback implementation.
                console.log('Fallback to download', blob)
                const a = document.createElement('a');
                a.download = getFileName(message.data.file);
                a.style.display = 'none';
                a.href = URL.createObjectURL(blob);
                a.addEventListener('click', () => {
                    setTimeout(() => {
                        URL.revokeObjectURL(a.href);
                        a.remove();
                    }, 1000)
                });
                document.body.append(a);
                a.click();
                await present({
                    position: 'bottom',
                    color: 'primary',
                    duration: 600,
                    message: 'Downloaded!',
                })

                onSuccess()
                setLoading(false)
            }
        } else {
            return present({
                color: 'danger',
                duration: 600,
                message: "Sharing is not supported on this device or the file failed to download.",

            })
                .then(() => setLoading(false))
        }




    };

    const isFile = message.data.message_type !== 'Text'

    const isDownload = isFile && !webShareSupported

    if (!isFile && !webShareSupported) return null

    return (
        <ActionItem onClick={shareMessage} isLoading={loading}>
            <ActionIcon icon={isDownload ? downloadOutline : shareOutline} />
            <ActionLabel label={isDownload ? 'Download' : 'Share'} />
        </ActionItem>
    )
}