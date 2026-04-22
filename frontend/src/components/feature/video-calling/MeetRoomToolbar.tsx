import { IconButton, Tooltip } from '@radix-ui/themes'
import {
	BiMicrophone,
	BiMicrophoneOff,
	BiPhoneOff,
	BiVideo,
	BiVideoOff,
} from 'react-icons/bi'

type Props = {
	audioEnabled: boolean
	videoEnabled: boolean
	onToggleAudio: () => void
	onToggleVideo: () => void
	onLeave: () => void
}

/**
 * Minimal meeting controls: mute mic, toggle camera, leave.
 *
 * Screen share, reactions, raise hand, chat panel, host controls —
 * all tracked as follow-ups. The layout leaves room for them: add
 * buttons to the center cluster before the leave button.
 */
const MeetRoomToolbar = ({
	audioEnabled,
	videoEnabled,
	onToggleAudio,
	onToggleVideo,
	onLeave,
}: Props) => {
	return (
		<div className='flex items-center justify-center gap-3 py-3 bg-gray-11/90 backdrop-blur'>
			<Tooltip content={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}>
				<IconButton
					size='3'
					variant={audioEnabled ? 'soft' : 'solid'}
					color={audioEnabled ? 'gray' : 'red'}
					onClick={onToggleAudio}
					aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
				>
					{audioEnabled ? <BiMicrophone size={20} /> : <BiMicrophoneOff size={20} />}
				</IconButton>
			</Tooltip>

			<Tooltip content={videoEnabled ? 'Turn camera off' : 'Turn camera on'}>
				<IconButton
					size='3'
					variant={videoEnabled ? 'soft' : 'solid'}
					color={videoEnabled ? 'gray' : 'red'}
					onClick={onToggleVideo}
					aria-label={videoEnabled ? 'Turn camera off' : 'Turn camera on'}
				>
					{videoEnabled ? <BiVideo size={20} /> : <BiVideoOff size={20} />}
				</IconButton>
			</Tooltip>

			<Tooltip content='End call'>
				<IconButton
					size='3'
					color='red'
					onClick={onLeave}
					aria-label='End call'
				>
					<BiPhoneOff size={20} />
				</IconButton>
			</Tooltip>
		</div>
	)
}

export default MeetRoomToolbar
