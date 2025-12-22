import { Flex, IconButton, Text, Spinner } from "@radix-ui/themes"
import { useState, useRef, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Popover } from "@radix-ui/themes"
import { IoCloseCircleOutline } from "react-icons/io5"

interface ToolbarFileProps {
    addFile: (file: File) => void
}

interface VoiceRecorderProps {
    fileProps: ToolbarFileProps
    isRecording: boolean
    setIsRecording: (isRecording: boolean) => void
}


const VoiceRecorder = ({ fileProps, isRecording, setIsRecording }: VoiceRecorderProps) => {
    const [recordingDuration, setRecordingDuration] = useState(0)
    const [permissionState, setPermissionState] = useState<PermissionState | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const isInitializingRef = useRef(false)

    const cleanup = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        if (mediaRecorderRef.current?.state !== 'inactive') {
            mediaRecorderRef.current?.stop()
        }
        mediaRecorderRef.current = null
        audioChunksRef.current = []
        setRecordingDuration(0)
        isInitializingRef.current = false
    }, [])

    const initializeRecording = useCallback(async () => {
        // This is to prevent multiple recordings from being initialized at the same time
        if (isInitializingRef.current || mediaRecorderRef.current) {
            return
        }

        isInitializingRef.current = true

        // Check permission before trying to access the microphone for better UI transitions
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setPermissionState(permissionStatus.state)
        if (permissionStatus.state === 'denied') {
            toast.error('Microphone access denied. Please check permissions.')
            setIsRecording(false)
            return
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            if (stream) {
                streamRef.current = stream
                setPermissionState('granted')

                const mimeType = MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4'

                const mediaRecorder = new MediaRecorder(stream, { mimeType })
                mediaRecorderRef.current = mediaRecorder
                audioChunksRef.current = []

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data)
                    }
                }

                mediaRecorder.start(1000)
                setRecordingDuration(0)

                timerRef.current = setInterval(() => {
                    setRecordingDuration(prev => prev + 1)
                }, 1000)
            }
        } catch (error) {
            if (error != 'NotAllowedError: Permission dismissed') {
                toast.error('Microphone access denied. Please check permissions.')
            }
            setIsRecording(false)
        }
    }, [setIsRecording])

    const saveRecording = useCallback(() => {
        const mediaRecorder = mediaRecorderRef.current
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            return
        }

        mediaRecorder.onstop = () => {
            const mimeType = mediaRecorder.mimeType
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
            const extension = mimeType.includes('webm') ? 'webm' : 'm4a'
            const fileName = `voice_note_${Date.now()}.${extension}`
            const audioFile = new File([audioBlob], fileName, { type: mimeType })

            fileProps.addFile(audioFile)
            cleanup()
        }

        mediaRecorder.stop()
    }, [fileProps, cleanup])

    useEffect(() => {
        if (isRecording) {
            initializeRecording()
        } else {
            saveRecording()
        }
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [isRecording, initializeRecording, saveRecording, cleanup])

    const discardRecording = useCallback(() => {
        cleanup()
        setIsRecording(false)
    }, [cleanup, setIsRecording])

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (permissionState === 'granted') {
        return (
            <Flex align='center' gap='4'>
                <Flex align='center' gap='2'>
                    <span className='h-2 w-2 rounded-full bg-red-500 animate-pulse' />
                    <Text size='2' weight='medium' className='font-mono min-w-[40px]'>
                        {formatDuration(recordingDuration)}
                    </Text>
                </Flex>

                <Flex gap='2'>
                    <Popover.Close>
                        <IconButton
                            size='2'
                            variant='ghost'
                            color='red'
                            onClick={discardRecording}
                            title='Discard'
                            aria-label='discard recording'
                        >
                            <IoCloseCircleOutline size={16} />
                        </IconButton>
                    </Popover.Close>
                </Flex>
            </Flex>
        )
    }

    return (
        <Flex align='center' justify='center'>
            <Spinner size='2' />
            {permissionState === 'prompt' && <Text size='2' ml='2' color='gray' className='animate-fadein'>Waiting for microphone access...</Text>}
        </Flex>
    )
}

export default VoiceRecorder