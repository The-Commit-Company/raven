import { useFrappeEventListener } from 'frappe-react-sdk';
import { useNavigate, useParams } from 'react-router-dom';

const AIThreadAutoOpen = () => {
    const navigate = useNavigate();
    const { workspaceID, channelID } = useParams();

    // Listen for ai_thread_created event
    useFrappeEventListener('ai_thread_created', (data) => {
        if (data.is_ai_thread && data.thread_id && data.channel_id && channelID === data.channel_id && workspaceID) {
            // Navigate to the AI thread - data.channel_id is the original DM channel, data.thread_id is the message ID
            navigate(`/${workspaceID}/${data.channel_id}/thread/${data.thread_id}`);
        }
    });

    return null;
};

export default AIThreadAutoOpen;