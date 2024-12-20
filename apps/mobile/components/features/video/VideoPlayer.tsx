import { useVideoPlayer, VideoSource, VideoView } from 'expo-video'

const VideoPlayer = ({ source }: { source: VideoSource }) => {

    const player = useVideoPlayer(source, player => {
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