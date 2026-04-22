import { Button, Flex, Heading, Switch, Text, TextField } from '@radix-ui/themes'
import { useEffect, useRef, useState } from 'react'
import { BiMicrophone, BiMicrophoneOff, BiVideo, BiVideoOff } from 'react-icons/bi'
import { toast } from 'sonner'
import type { MeetConnectionDetails } from '@/pages/meeting/FrappeMeetRoom'

/**
 * Choices captured before joining the meeting room. Mirrors the
 * `LocalUserChoices` shape from `@livekit/components-react` so the
 * downstream `MeetRoomActive` API stays compatible if we ever swap
 * implementations.
 */
export type LocalUserChoices = {
    username: string
    audioEnabled: boolean
    videoEnabled: boolean
    audioDeviceId?: string
    videoDeviceId?: string
}

type Props = {
    details: MeetConnectionDetails
    defaultUsername: string
    onJoin: (choices: LocalUserChoices) => void
    onCancel: () => void
}

/**
 * Pre-join screen: lets the user check their camera, mic and pick a
 * display name before connecting to the SFU. Equivalent of
 * `MeetingPreview.vue` in frappe/meet, simplified for the v1 React port.
 */
const MeetRoomPreJoin = ({ details, defaultUsername, onJoin, onCancel }: Props) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [username, setUsername] = useState(defaultUsername)
    const [videoEnabled, setVideoEnabled] = useState(true)
    const [audioEnabled, setAudioEnabled] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true

        async function start() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                })
                if (!active) {
                    stream.getTracks().forEach((t) => t.stop())
                    return
                }
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
            } catch (err) {
                setError(
                    'Could not access camera or microphone. Check the browser permissions and try again.'
                )
                console.error('PreJoin getUserMedia error:', err)
            }
        }

        start()

        return () => {
            active = false
            streamRef.current?.getTracks().forEach((t) => t.stop())
            streamRef.current = null
        }
    }, [])

    // Apply enable/disable toggles to the live preview
    useEffect(() => {
        const stream = streamRef.current
        if (!stream) return
        stream.getVideoTracks().forEach((t) => (t.enabled = videoEnabled))
        stream.getAudioTracks().forEach((t) => (t.enabled = audioEnabled))
    }, [videoEnabled, audioEnabled])

    const handleJoin = () => {
        if (!username.trim()) {
            toast.error('Please enter a display name')
            return
        }
        onJoin({
            username: username.trim(),
            audioEnabled,
            videoEnabled,
        })
    }

    return (
        <div className='w-screen h-screen bg-gray-1 flex items-center justify-center p-6'>
            <div className='w-full max-w-3xl flex flex-col gap-6'>
                <Flex direction='column' align='center' gap='1'>
                    <Heading size='5'>{details.room_name}</Heading>
                    <Text size='2' className='text-gray-11'>Ready to join?</Text>
                </Flex>

                <div className='relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-xl'>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className='w-full h-full object-cover scale-x-[-1]'
                    />
                    {!videoEnabled && (
                        <div className='absolute inset-0 flex items-center justify-center bg-gray-12'>
                            <Text size='5' className='text-gray-1'>Camera off</Text>
                        </div>
                    )}
                    <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2'>
                        <Button
                            variant='soft'
                            color={audioEnabled ? 'gray' : 'red'}
                            onClick={() => setAudioEnabled((v) => !v)}
                        >
                            {audioEnabled ? <BiMicrophone size={18} /> : <BiMicrophoneOff size={18} />}
                        </Button>
                        <Button
                            variant='soft'
                            color={videoEnabled ? 'gray' : 'red'}
                            onClick={() => setVideoEnabled((v) => !v)}
                        >
                            {videoEnabled ? <BiVideo size={18} /> : <BiVideoOff size={18} />}
                        </Button>
                    </div>
                </div>

                {error && (
                    <Text size='2' color='red' align='center'>{error}</Text>
                )}

                <Flex direction='column' gap='3'>
                    <label>
                        <Text as='div' size='2' weight='medium' mb='1'>Your name</Text>
                        <TextField.Root
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder='Display name'
                            maxLength={50}
                        />
                    </label>
                </Flex>

                <Flex gap='3' justify='center'>
                    <Button variant='soft' color='gray' onClick={onCancel} size='3'>Cancel</Button>
                    <Button onClick={handleJoin} disabled={!!error} size='3'>
                        Join now
                    </Button>
                </Flex>
            </div>
        </div>
    )
}

export default MeetRoomPreJoin
