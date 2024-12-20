import useFileURL from '@hooks/useFileURL'
import { useVideoPlayer, VideoView } from 'expo-video'

const VideoPlayer = ({ uri }: { uri: string }) => {

    const source = useFileURL(uri)

    const player = useVideoPlayer(source ?? {}, player => {
        player.loop = true
        player.play()
    })

    return (
        <VideoView player={player}
            allowsFullscreen
            style={
                {
                    width: '100%',
                    height: '100%',
                }
            } />
    )
}

export default VideoPlayer