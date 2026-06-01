import { CommandGroup, CommandItem } from '@components/ui/command'
import { ChannelIconLucide } from '@components/common/ChannelIcon/ChannelIconLucide'
import { useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { commandMenuOpenAtom } from './atoms'
import { useMemo } from 'react'
import _ from '@lib/translate'
import { Badge } from '@components/ui/badge'
import { useChannels } from '@hooks/useChannels'
import { BiBuildings } from 'react-icons/bi'

const ChannelList = ({ text }: { text: string }) => {
    const { channels } = useChannels()
    const navigate = useNavigate()
    const setOpen = useSetAtom(commandMenuOpenAtom)

    const filteredChannels = useMemo(() => {
        if (!text) return channels.filter(c => !c.is_archived).slice(0, 3)
        const query = text.toLowerCase()
        return channels.filter(c =>
            c.channel_name.toLowerCase().includes(query)
        )
    }, [channels, text])

    if (!filteredChannels.length) return null

    return (
        <CommandGroup heading={_("Channels")}>
            {filteredChannels.map(channel => channel.name && (
                <CommandItem
                    key={channel.name}
                    value={channel.name}
                    keywords={[channel.channel_name]}
                    onSelect={() => {
                        navigate(`/${channel.workspace}/${channel.name}`)
                        setOpen(false)
                    }}
                    className='cursor-pointer'
                >
                    <ChannelIconLucide type={channel.type} className="h-4 w-4 shrink-0" />
                    <span className="truncate">{channel.channel_name}</span>
                    {channel.is_archived ? (
<Badge variant="subtle" className="ml-auto text-xs">
    {_("Archived")}
</Badge>
                    ) : null}
                    <div className="flex items-center ml-auto gap-1 text-xs text-ink-gray-4">
                        <BiBuildings className="h-4 w-4" />
                        <span>{channel.workspace}</span>
                    </div>
                </CommandItem>
            ))}
        </CommandGroup>
    )
}

export default ChannelList
