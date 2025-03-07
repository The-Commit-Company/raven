import { useState } from 'react'
import { View } from 'react-native'
import ChannelFilter from './thread-filters/ChannelFilter'

const ThreadFilters = () => {

    const [channel, setChannel] = useState('all')

    return (
        <View>
            <ChannelFilter channel={channel} setChannel={setChannel} />
        </View>
    )
}

export default ThreadFilters