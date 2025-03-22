import { TouchableOpacity, View } from 'react-native'
import { useState } from 'react'
import { useDebounce } from '@raven/lib/hooks/useDebounce'
import { useColorScheme } from '@hooks/useColorScheme'
import ThreadsList from './ThreadsList'
import ChannelFilter from './thread-filters/ChannelFilter'
import { Text } from '@components/nativewindui/Text'
import { ChannelIcon } from '../channels/ChannelList/ChannelIcon'
import CrossIcon from '@assets/icons/CrossIcon.svg'
import { COLORS } from '@theme/colors'
import { Divider } from '@components/layout/Divider'
import SearchInput from '@components/common/SearchInput/SearchInput'

/**
 * Component for displaying other threads - where the user is not a member of the thread but is a member of the channel
 */
const OtherThreads = () => {

    const [searchQuery, setSearchQuery] = useState("")
    const debouncedText = useDebounce(searchQuery, 200)
    const { colors } = useColorScheme()
    const [channel, setChannel] = useState('all')

    return (
        <View className="flex flex-col">
            <View className='flex flex-col gap-3 px-4'>
                <View className="flex flex-row items-center gap-2">
                    <View className="flex-1 max-w-[90%]">
                        <SearchInput
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                        />
                    </View>
                    <ChannelFilter channel={channel} setChannel={setChannel} />
                </View>
                {channel !== 'all' && (
                    <TouchableOpacity onPress={() => setChannel('all')} className="self-start">
                        <View className='flex flex-row items-center gap-1 px-2 py-1.5 bg-primary/10 dark:bg-primary/30 rounded-full'>
                            <ChannelIcon fill={colors.foreground} size={14} type={'channel'} />
                            <Text className='text-xs font-medium'>{channel === 'all' ? 'All' : channel}</Text>
                            <View className='bg-slate-500 rounded-full p-0.5 ml-1'>
                                <CrossIcon color={COLORS.white} height={10} width={10} />
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
            <Divider className='mx-0 mt-3' prominent />
            <ThreadsList
                content={debouncedText}
                endpoint='raven.api.threads.get_other_threads'
                channel={channel}
            />
        </View>
    )
}

export default OtherThreads