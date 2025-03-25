import { Stack } from '@/components/layout/Stack';
import { formatChatMessageLinks, LiveKitRoom, LocalUserChoices, MediaDeviceMenu, TrackToggle, useMaybeLayoutContext, VideoConference } from '@livekit/components-react';
import { IconButton } from '@radix-ui/themes';
import { Room, RoomOptions, Track, VideoPresets } from 'livekit-client';
import { useCallback, useMemo } from 'react';
import { FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export type ConnectionDetails = {
    serverUrl: string;
    roomName: string;
    participantName: string;
    participantToken: string;
    channelID: string;
    workspaceID?: string;
};

type Props = {
    connectionDetails: ConnectionDetails;
    userChoices: LocalUserChoices;
}

const VideoConferenceComponent = ({ connectionDetails, userChoices }: Props) => {

    const roomOptions = useMemo((): RoomOptions => {

        return {
            videoCaptureDefaults: {
                deviceId: userChoices.videoDeviceId ?? undefined,
                resolution: VideoPresets.h720,
            },
            publishDefaults: {
                videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
            },
            audioCaptureDefaults: {
                deviceId: userChoices.audioDeviceId ?? undefined,
            },
            dynacast: true,
        };
    }, [userChoices]);

    const room = useMemo(() => new Room(roomOptions), [])

    const navigate = useNavigate()

    const handleOnLeave = useCallback(() => navigate('/'), []);

    const handleError = useCallback((error: Error) => {
        console.error(error);
        alert(`Encountered an unexpected error, check the console logs for details: ${error.message}`);
    }, []);

    return (
        <LiveKitRoom
            room={room}
            token={connectionDetails.participantToken}
            serverUrl={connectionDetails.serverUrl}
            video={userChoices.videoEnabled}
            audio={userChoices.audioEnabled}
            onDisconnected={handleOnLeave}
            onError={handleError}
        >
            <VideoConference
                SettingsComponent={SettingsBar}
                chatMessageFormatter={formatChatMessageLinks}
            />
        </LiveKitRoom>
    )
}


const SettingsBar = () => {

    const layoutContext = useMaybeLayoutContext();

    const settings = useMemo(() => {
        return {
            media: { camera: true, microphone: true, label: 'Media Devices', speaker: true },
            effects: { label: 'Effects' },
        };
    }, []);

    return <Stack className='relative h-full w-full'>
        <div>
            <h3>Camera</h3>
            <section className="lk-button-group">
                <TrackToggle source={Track.Source.Camera}>Camera</TrackToggle>
                <div className="lk-button-group-menu">
                    <MediaDeviceMenu kind="videoinput" />
                </div>
            </section>
        </div>

        <div>
            <h3>Microphone</h3>
            <section className="lk-button-group">
                <TrackToggle source={Track.Source.Microphone}>Microphone</TrackToggle>
                <div className="lk-button-group-menu">
                    <MediaDeviceMenu kind="audioinput" />
                </div>
            </section>
        </div>
        <div className='absolute right-2 top-2'>
            <IconButton
                // color='gray'
                className='bg-transparent'
                aria-label='Close'
                onClick={() => layoutContext?.widget.dispatch?.({ msg: 'toggle_settings' })}
            >
                <FiX size='20px' />
            </IconButton>
        </div>



    </Stack>

}

export default VideoConferenceComponent