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
import UnreadFilter from './thread-filters/UnreadFilter'
import SearchInput from '@components/common/SearchInput/SearchInput'

/**
 * Component for displaying participating threads - where the user is a member of the thread
 */
const ParticipatingThreads = () => {

    const [onlyShowUnread, setOnlyShowUnread] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const debouncedText = useDebounce(searchQuery, 200)
    const { colors } = useColorScheme()
    const [channel, setChannel] = useState('all')

    return (
        <View className="flex flex-col">
            <View className='flex flex-col gap-3 px-3'>
                <View className="flex flex-row items-center gap-2">
                    <View className="flex-1 max-w-[80%]">
                        <SearchInput
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                        />
                    </View>
                    <ChannelFilter channel={channel} setChannel={setChannel} />
                    <UnreadFilter onlyShowUnread={onlyShowUnread} setOnlyShowUnread={setOnlyShowUnread} />
                </View>
                {channel !== 'all' && (
                    <TouchableOpacity onPress={() => setChannel('all')} className="self-start">
                        <View className='flex flex-row items-center gap-1 px-2 py-1.5 bg-primary/10 dark:bg-primary/30 rounded-full'>
                            <ChannelIcon fill={colors.foreground} size={14} type={'channel'} />
                            <Text className='text-xs font-medium'>{channel === 'all' ? 'All' : channel}</Text>
                            <View className='bg-slate-400 dark:bg-slate-600 rounded-full p-0.5 ml-1'>
                                <CrossIcon color={COLORS.white} height={10} width={10} />
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
            <Divider className='mx-0 mt-3' prominent />
            <ThreadsList
                content={debouncedText}
                channel={channel}
                onlyShowUnread={onlyShowUnread}
            />
        </View>
    )
}

export default ParticipatingThreads