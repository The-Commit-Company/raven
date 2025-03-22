import { View } from "react-native"
import { useState } from "react"
import { useDebounce } from "@raven/lib/hooks/useDebounce"
import { useColorScheme } from "@hooks/useColorScheme"
import ThreadsList from "./ThreadsList"
import { Divider } from "@components/layout/Divider"
import UnreadFilter from "./thread-filters/UnreadFilter"
import SearchInput from "@components/common/SearchInput/SearchInput"

/**
 * Component for displaying AI threads - these are all DMs with the AI
 */
const AIThreads = () => {

    const [onlyShowUnread, setOnlyShowUnread] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const debouncedText = useDebounce(searchQuery, 200)
    const { colors } = useColorScheme()

    return (
        <View className="flex flex-col">
            <View className="flex flex-row items-center gap-2 px-4">
                <View className="flex-1 max-w-[90%]">
                    <SearchInput
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                    />
                </View>
                <UnreadFilter onlyShowUnread={onlyShowUnread} setOnlyShowUnread={setOnlyShowUnread} />
            </View>
            <Divider className='mx-0 mt-3' prominent />
            <ThreadsList
                content={debouncedText}
                aiThreads={1}
                onlyShowUnread={onlyShowUnread}
            />
        </View>
    )
}

export default AIThreads
