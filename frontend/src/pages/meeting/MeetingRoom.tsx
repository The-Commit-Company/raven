import { useParams } from 'react-router-dom'
import {
    LocalUserChoices,
    PreJoin,
} from '@livekit/components-react';
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import { useUserData } from '@/hooks/useUserData';
import { useMemo, useState } from 'react';
import '@/livekit.css'
import { toast } from 'sonner';
import { useFrappePostCall } from 'frappe-react-sdk';
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner';
import VideoConferenceComponent, { ConnectionDetails } from '@/components/feature/video-calling/VideoConferenceComponent';




/**
 * This is the meeting room page with a roomID param - this is where the video call is rendered
 */
const MeetingRoom = () => {

    const { roomID } = useParams()

    /** Store the user's pre-join choices */
    const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | undefined>(
        undefined,
    );

    const userData = useUserData()

    const { call: joinRoom } = useFrappePostCall<{ message: ConnectionDetails }>('raven.api.livekit.join_room')

    const preJoinDefaults: Partial<LocalUserChoices> = useMemo(() => {
        return {
            username: userData.full_name,
        };
    }, []);

    const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | undefined>(
        undefined,
    );

    const handlePreJoinSubmit = (data: LocalUserChoices) => {
        setPreJoinChoices(data)
        // Fetch the access token and also check for permissions here
        console.log(data)
        joinRoom({
            room_id: roomID
        }).then((result) => {
            setConnectionDetails(result.message)
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to join meeting', {
                description: getErrorMessage(error)
            })
        })
    }

    const handlePreJoinError = (error: Error) => {
        console.error(error)
        toast.error('Failed to join meeting', {
            description: error.message
        })
    }

    return (
        <main data-lk-theme="default" className='w-screen h-screen'>
            {connectionDetails === undefined || preJoinChoices === undefined ? (
                <div style={{ display: 'grid', placeItems: 'center', height: '100%' }} className='bg-[var(--lk-bg)]'>
                    <PreJoin
                        defaults={preJoinDefaults}
                        persistUserChoices
                        onSubmit={handlePreJoinSubmit}
                        onError={handlePreJoinError}
                    />
                </div>
            ) : <VideoConferenceComponent connectionDetails={connectionDetails} userChoices={preJoinChoices} />}
        </main>
    )
}

export const Component = MeetingRoom