import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { Badge, Flex } from "@radix-ui/themes"
import { Command } from "cmdk"
import { useNavigate } from "react-router-dom"
import { useSetAtom } from 'jotai'
import { commandMenuOpenAtom } from "./CommandMenu"

const ChannelItem = ({ channel }: { channel: ChannelListItem }) => {

    const navigate = useNavigate()

    const setOpen = useSetAtom(commandMenuOpenAtom)

    const onSelect = () => {
        setOpen(false)
        navigate(`/channel/${channel.name}`)
    }

    return <Command.Item
        keywords={[channel.channel_name]}
        value={channel.name}
        onSelect={onSelect}>
        <Flex gap='2' align='center' justify={'between'} width='100%'>
            <Flex gap='2' align='center'>
                <ChannelIcon type={channel.type} size='18' />
                {channel.channel_name}
            </Flex>
            {channel.is_archived ? <Badge color='gray' variant='soft'>Archived</Badge> : null}
        </Flex>
    </Command.Item>
}

export default ChannelItem