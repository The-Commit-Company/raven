import { copyOutline } from 'ionicons/icons';
import { ActionIcon, ActionItem, ActionLabel, ActionProps } from './common'
import { useIonToast } from '@ionic/react';
import turndown from 'turndown'
import { useState } from 'react';


export const CopyAction = ({ message, onSuccess }: ActionProps) => {

    // The copy action would only be available for text messages

    //TODO: Extend this to other message types as well - one can have text content with image/file attachments as well
    if (message.message_type !== 'Text') return null

    return <CopyActionItem message={message} onSuccess={onSuccess} />
}

const CopyActionItem = ({ message, onSuccess }: ActionProps) => {

    const [present] = useIonToast();

    const [loading, setLoading] = useState(false)

    const writeToClipboard = () => {
        if (message.message_type !== 'Text') {
            return
        }

        setLoading(true)

        let text = message.text

        // Remove all empty lines
        text = text.replace(/^\s*[\r\n]/gm, "")

        var turndownService = new turndown({
            codeBlockStyle: 'fenced',
        })

        // We want the links to not be converted to markdown links

        turndownService.addRule('links', {
            filter: 'a',
            replacement: function (content, node, options) {
                return node.textContent ?? content
            }
        })
        var markdown = turndownService.turndown(text)
        // If it's iOS, we need a different way to copy

        navigator.clipboard.writeText(markdown)
            .then(() => present({
                position: 'bottom',
                color: 'primary',
                duration: 600,
                message: 'Copied!',
            }))
            .then(() => setLoading(false))
            .then(() => onSuccess())
            .catch((e) => {
                present({
                    color: 'danger',
                    duration: 600,
                    message: "Error: Could not copy - " + e.message || "Unknown Error",
                })
                setLoading(false)
            })

    };

    return (
        <ActionItem onClick={writeToClipboard} isLoading={loading}>
            <ActionIcon icon={copyOutline} />
            <ActionLabel label='Copy' />
        </ActionItem>
    )
}