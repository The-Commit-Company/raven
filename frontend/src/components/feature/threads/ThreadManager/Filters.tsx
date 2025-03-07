import { IconButton, Tooltip } from "@radix-ui/themes"

import { useChannelList } from "@/utils/channel/ChannelListProvider"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { Select, Text, TextField } from "@radix-ui/themes"
import { BiFilter, BiSearch } from "react-icons/bi"
import { toast } from "sonner"

export const SearchFilter = ({ search, setSearch }: { search: string, setSearch: (search: string) => void }) => {
    return (
        <div>
            <TextField.Root placeholder="Search threads..." value={search} onChange={(e) => setSearch(e.target.value)} className='sm:min-w-64'>
                <TextField.Slot>
                    <BiSearch size={16} />
                </TextField.Slot>
            </TextField.Root>
        </div>

    )
}

export const ChannelFilter = ({ channel, setChannel }: { channel: string, setChannel: (channel: string) => void }) => {

    const { channels } = useChannelList()
    return (
        <div>
            <Select.Root value={channel} onValueChange={setChannel}>
                <Select.Trigger placeholder='Channel / DM' className='sm:min-w-48' />
                <Select.Content className="z-50">
                    <Select.Item value='all'>Any Channel</Select.Item>
                    {channels.map(channel => <Select.Item key={channel.name} value={channel.name}>
                        <div className='gap-1 items-center flex overflow-hidden'>
                            <ChannelIcon type={channel.type} />
                            <Text style={{
                                maxWidth: '20ch'
                            }} className='text-ellipsis whitespace-break-spaces line-clamp-1 pb-0.5'>{channel.channel_name}</Text>
                        </div>
                    </Select.Item>)}
                </Select.Content>
            </Select.Root>
        </div>
    )
}

export const UnreadFilter = ({ onlyShowUnread, setOnlyShowUnread }: { onlyShowUnread: boolean, setOnlyShowUnread: (onlyShowUnread: boolean) => void }) => {

    const onToggle = () => {
        const currentValue = onlyShowUnread
        setOnlyShowUnread(!onlyShowUnread)

        if (currentValue) {
            toast.info('Viewing all threads', {
                position: 'bottom-center',
                duration: 800
            })
        } else {
            toast.info('Viewing only unread threads', {
                position: 'bottom-center',
                duration: 800
            })
        }
    }

    const text = onlyShowUnread ? 'Showing only unread threads' : 'Showing all threads'

    return (
        <Tooltip content={"Filter unread threads"}>
            <IconButton
                variant={onlyShowUnread ? 'solid' : 'soft'}
                aria-label={text}
                title={text}
                onClick={onToggle}>
                <BiFilter size={16} />
            </IconButton>
        </Tooltip>
    )
}