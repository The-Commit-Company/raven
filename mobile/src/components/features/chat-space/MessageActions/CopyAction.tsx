import { copyOutline } from 'ionicons/icons';
import { ActionIcon, ActionItem, ActionLabel, ActionProps } from './common'
import { useIonToast } from '@ionic/react';

export const CopyAction = ({ message, onSuccess }: ActionProps) => {

    // The copy action would only be available for text messages

    //TODO: Extend this to other message types as well - one can have text content with image/file attachments as well
    if (message.data.message_type !== 'Text') return null

    return <CopyActionItem message={message} onSuccess={onSuccess} />
}

const CopyActionItem = ({ message, onSuccess }: ActionProps) => {

    const [present] = useIonToast();

    const writeToClipboard = () => {
        if (message.data.message_type !== 'Text') {
            return
        }

        navigator.clipboard.writeText(message.data.text)
            .then(() => present({
                position: 'bottom',
                color: 'primary',
                duration: 600,
                message: 'Copied!',
            }))
            .then(() => onSuccess())
            .catch((e) => present({
                color: 'danger',
                duration: 600,
                message: "Error: Could not copy - " + e.message || "Unknown Error",
            }))
    };

    return (
        <ActionItem onClick={writeToClipboard}>
            <ActionIcon icon={copyOutline} />
            <ActionLabel label='Copy' />
        </ActionItem>
    )
}